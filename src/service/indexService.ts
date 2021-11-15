import {queryValue, saveValue} from '../dao/baseConfigDao';
const _ = require('lodash');
import {ApiPromise, WsProvider} from '@polkadot/api';
import {typesBundleForPolkadot} from '@crustio/type-definitions';
import {configs} from '../config/index';
import {logger} from '../logger';
import {
  batchQueryFileInfoByCid,
  fixKnownFile,
  markAccessFiles,
  markNoCacheFiles,
  queryFilesToIndex,
  queryUnknownFiles,
  updateFileIndexState,
} from '../dao/fileInfoDao';
import {
  CrustFileInfo,
  FileInfo,
  FileInfos,
  FileNeedIndex,
  FileSource,
} from '../models/FileInfo';
import {sleep} from '../common/commonUtils';
import {queryAll} from '../dao/gatewayDao';
import {findprovs} from './ipfsService';
import {batchUpsertPeers} from '../dao/peersInfoDao';
const indexCrustFileBatchSize = 50;
const indexFileBatchSize = 5;
const MarketFilesKey =
  '0x5ebf094108ead4fefa73f7a3b13cb4a7b3b78f30e9b952d60249b22fcdaaa76d';
const KeyLastIndexedKey = 'db-indexer:LastIndexedKey';
let api: any;

export async function indexCrustFileInDb() {
  logger.info('start index crust files in db');
  for (;;) {
    await indexCrustFiles();
    await sleep(configs.crust.indexLoopAwait);
  }
}

export async function indexFilePeersInDb() {
  logger.info('index file peers in db');
  for (;;) {
    await indexFilePeers();
    await sleep(configs.crust.indexLoopAwait);
  }
}

export async function markAndFixFileInfos() {
  logger.info('mark and fix files');
  for (;;) {
    await markAndFixFile();
    await sleep(configs.crust.indexLoopAwait);
  }
}

export async function fixUnknownSourceFiles() {
  logger.info('fix unknown files');
  for (;;) {
    await fixUnknownFiles();
    await sleep(configs.crust.indexLoopAwait);
  }
}

async function fixUnknownFiles() {
  try {
    const unknownFiles = await queryUnknownFiles();
    if (_.isEmpty(unknownFiles)) {
      logger.info('unknown file empty');
      return;
    }
    await Promise.all(
      _.map(unknownFiles, (i: any) => {
        return queryAndFixUnknownFile(i);
      })
    );
  } catch (e) {
    logger.error(`fix unknown files failed: ${e.message}`);
  }
}

async function queryAndFixUnknownFile(f: any) {
  if (_.isEmpty(api)) {
    api = await ApiPromise.create({
      provider: new WsProvider(configs.crust.chainWsUrl),
      typesBundle: typesBundleForPolkadot,
    });
  }
  await api.isReady;
  const file = await queryCrustFile(api, f.cid);
  if (!_.isEmpty(file)) {
    f.expired_at = file.expired_at;
    f.calculated_at = file.calculated_at;
    f.source = FileSource.crust;
  } else {
    f.source = FileSource.others;
  }
  return fixKnownFile(f);
}

async function markAndFixFile() {
  try {
    await markAccessFiles();
    await markNoCacheFiles();
  } catch (e) {
    logger.error(`mark file failed ${e.message}`);
  }
}

async function indexFilePeers() {
  // query index files
  try {
    const files = await queryFilesToIndex(indexFileBatchSize);
    const gateways = await queryAll();
    if (_.isEmpty(files) || _.isEmpty(gateways)) {
      logger.warn('no files need index peers');
      return;
    }
    await Promise.all(
      _.map(files, (f: any) => {
        return indexOneFilePeers(f as FileInfo, gateways);
      })
    );
  } catch (e) {
    logger.error(`index file peers error: ${e.stack}`);
  }
}

async function indexOneFilePeers(f: FileInfo, gateways: any) {
  const peers = await Promise.all(
    _.map(gateways, (g: any) => {
      return findprovs(f.cid, g.baseUrl, g.id, false).then((r: any) => {
        return {
          fileId: f.id,
          gatewayId: g.id,
          peers: r,
        };
      });
    })
  );
  await batchUpsertPeers(peers);
  await updateFileIndexState(f.id, FileNeedIndex.no);
}

async function indexCrustFiles() {
  try {
    if (_.isEmpty(api)) {
      api = await ApiPromise.create({
        provider: new WsProvider(configs.crust.chainWsUrl),
        typesBundle: typesBundleForPolkadot,
      });
    }
    await api.isReady;
    // query last crust file
    const lastKey = await queryValue(KeyLastIndexedKey);
    let cids = await queryCidList(lastKey);
    if (_.isEmpty(cids)) {
      logger.warn(`empty result from: ${lastKey}`);
      await saveValue(KeyLastIndexedKey, '');
      return;
    }
    const allCid: string[] = _.map(cids, (c: any) => {
      return c.cid;
    });
    const existFiles = await batchQueryFileInfoByCid(allCid);
    const last = _.last(cids);
    // filter file not exist
    if (!_.isEmpty(existFiles)) {
      const group = _.groupBy(existFiles, (e: any) => {
        return e.cid;
      });
      cids = _.filter(cids, (c: any) => {
        return _.isEmpty(group[c.cid]);
      });
      if (_.isEmpty(cids)) {
        logger.info('all cids are duplicate');
        await saveValue(KeyLastIndexedKey, last.key);
        return;
      }
    }
    // query files from chain
    const files = await queryFileInfo(cids);
    // batch save files
    await FileInfos.bulkCreate(files);
    await saveValue(KeyLastIndexedKey, last.key);
  } catch (e) {
    logger.error(`indexCrustFile failed: ${e.stack}`);
  }
}

async function queryFileInfo(cids: any[]) {
  const files = await Promise.all(
    _.map(cids, (c: any) => {
      return queryCrustFile(api, c.cid).then(f => {
        if (f) {
          return {
            cid: c.cid,
            key: c.key,
            expiredAt: f.expired_at,
            calculatedAt: f.calculated_at,
          };
        }
        return null;
      });
    })
  );
  const fileToInsert = _(files)
    .compact()
    .map((f: any) => {
      return new FileInfo(f.cid, f.key, f.expiredAt, f.calculatedAt);
    })
    .value();
  logger.info(`batch create ${_.size(fileToInsert)} crust files`);
  return fileToInsert;
}

async function queryCidList(lastKey: string | null) {
  logger.info(
    `index crust files from: ${_.isEmpty(lastKey) ? 'first' : lastKey}`
  );
  const keys = await (_.isEmpty(lastKey)
    ? api.rpc.state.getKeysPaged(MarketFilesKey, indexCrustFileBatchSize)
    : api.rpc.state.getKeysPaged(
        MarketFilesKey,
        indexCrustFileBatchSize,
        lastKey
      ));
  logger.info('query success');
  const keyStrs = keys.map((k: any) => k.toString());
  return _.chain(keyStrs)
    .filter((k: any) => k !== lastKey)
    .map((key: any) => {
      const cid = cidFromStorageKey(key);
      if (cid) {
        return {
          cid,
          key,
        };
      }
      return null;
    })
    .compact()
    .value();
}

async function queryCrustFile(
  api: ApiPromise,
  cid: string
): Promise<CrustFileInfo | null> {
  await api.isReady;
  // query from chain
  const res = await api.query.market.files(cid);
  const file = res ? JSON.parse(JSON.stringify(res)) : null;
  if (_.isEmpty(file)) {
    logger.warn(`file ${cid} not exist on chain`);
    return null;
  }
  return file as CrustFileInfo;
}

export function isValidMarketSubKey(key: string): boolean {
  return key.startsWith(MarketFilesKey);
}

export function cidFromStorageKey(key: string): string | null {
  if (!isValidMarketSubKey(key)) {
    return null;
  }
  const cidInHex = key.substr(MarketFilesKey.length + 18);
  const cid = Buffer.from(cidInHex, 'hex')
    .toString()
    .replace(/[^\x00-\x7F]/g, ''); // eslint-disable-line
  return cid;
}
