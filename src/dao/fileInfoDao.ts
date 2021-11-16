import exp = require('constants');
const _ = require('lodash');
import * as dayjs from 'dayjs';
const commonDao = require('./commonDao');
import {FileInfos, FileNeedIndex, FileSource} from '../models/FileInfo';
import {getTimestamp} from '../common/commonUtils';
import {configs} from '../config';

export function queryFileInfoByCid(cid: string) {
  return FileInfos.findOne({
    where: {
      cid: cid,
    },
  });
}

export function batchQueryFileInfoByCid(cids: string[]) {
  return commonDao.queryForArray(
    `select cid from file_info where cid in (${cids
      .map((i: string) => {
        return `'${i}'`;
      })
      .join(',')})`
  );
}

export async function upsertFileAccessTime(cid: string, source: number) {
  await commonDao.queryForInsert(
    'insert into file_info(cid, access_time, source) values (?, now(), ?) ON DUPLICATE KEY UPDATE cid = VALUES(cid), access_time = VALUES(access_time)',
    [cid, source]
  );
}

export function queryFilesToIndex(fileSize: number) {
  return commonDao.queryForArray(
    `select * from file_info where need_index = ${FileNeedIndex.yes} order by access_time desc, source asc limit ${fileSize}`
  );
}

export function fixKnownFile(file: any) {
  if (!_.isNumber(file.expired_at)) {
    return commonDao.queryForUpdate(
      'update file_info set source = ? where id = ?',
      [file.source, file.id]
    );
  } else {
    return commonDao.queryForUpdate(
      'update file_info set expired_at = ?, calculated_at = ?, source = ? where id = ?',
      [file.expired_at, file.calculated_at, file.source, file.id]
    );
  }
}

export function updateFileIndexState(id: number, neexIndex: number) {
  return commonDao.queryForUpdate(
    'update file_info set need_index = ?, update_time = NOW() where id = ?',
    [neexIndex, id]
  );
}

export function markAccessFiles() {
  const update = dayjs()
    .subtract(configs.index.update_interval_days, 'day')
    .format('YYYY-MM-DD HH:mm:ss');
  const access = dayjs()
    .subtract(configs.index.access_interval_days, 'day')
    .format('YYYY-MM-DD HH:mm:ss');
  return commonDao.queryForUpdate(
    'update file_info set need_index = 0 where update_time < ? and access_time > ?',
    [update, access]
  );
}

export function markNoCacheFiles() {
  return commonDao.queryForUpdate(`UPDATE file_info SET need_index = 0 WHERE id IN (
  SELECT
      a.id 
  FROM
  ( SELECT f.id FROM file_info f WHERE ( SELECT count(*) FROM peers_info pi WHERE f.id = pi.file_info_id ) = 0 ) AS a 
  )`);
}

export function queryUnknownFiles() {
  return commonDao.queryForArray(
    'select * from file_info where source = ? order by id limit 10',
    [FileSource.unknown]
  );
}

export function createFileInfo(
  cid: string,
  source: number,
  storageKey?: string,
  expiredAt?: number,
  calculatedAt?: number
) {
  return FileInfos.create({
    cid: cid,
    storage_key: storageKey,
    expired_at: expiredAt ? expiredAt : null,
    calculated_at: calculatedAt ? calculatedAt : null,
    source: source,
  });
}
