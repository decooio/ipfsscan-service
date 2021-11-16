import {cache} from '../common/commonUtils';
const axios = require('axios');
const _ = require('lodash');
import {configs} from '../config';
import {findPeersByCidAndGatewayId} from '../dao/peersInfoDao';

export async function findprovs(
  cid: string,
  baseUrl: string,
  gatewayId: number,
  fromDb = true
): Promise<any> {
  const cacheKey = `PROVS_${gatewayId}_${cid}`;
  const cacheResult = cache.get(cacheKey);
  if (cacheResult === undefined) {
    const dbResult = await findPeersByCidAndGatewayId(cid, gatewayId);
    if (fromDb && !_.isEmpty(dbResult) && !_.isEmpty(dbResult.peers_info)) {
      return dbResult.peers_info;
    }
    const url = `${baseUrl}/api/v0/dht/findprovs?arg=${cid}&verbose=true&num-providers=${configs.ipfs.NUM_PROVIDERS}`;
    const config = {
      auth: {
        username: configs.ipfs.IPFS_AUTH_USERNAME,
        password: configs.ipfs.IPFS_AUTH_PASSWORD,
      },
      timeout: configs.ipfs.IPFS_HTTP_TIMEOUT,
    };
    const res = await axios.post(url, null, config);
    const providerList = res.data.split('\n');
    const result = _(providerList)
      .filter((i: string) => {
        return i !== '' && JSON.parse(i).Type === 4;
      })
      .map((i: string) => {
        return {
          id: JSON.parse(i).Responses[0].ID,
        };
      })
      .value();
    cache.set(cacheKey, result, configs.ipfs.CACHE_TTL);
    return result;
  }
  return cacheResult;
}
