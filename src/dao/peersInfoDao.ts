const commonDao = require('./commonDao');
const _ = require('lodash');

export function batchUpsertPeers(arr: any) {
  let args: any[] = [];
  const sqls = _.map(arr, (i: any) => {
    args = _.concat(args, [i.fileId, i.gatewayId, JSON.stringify(i.peers)]);
    return '(?, ?, ?, NOW())';
  });
  const sql = `
  INSERT INTO peers_info ( file_info_id, gateway_id, peers_info, update_time ) VALUES ${sqls.join(
    ','
  )} 
  ON DUPLICATE KEY UPDATE peers_info = VALUES( peers_info ), update_time = VALUES( update_time )`;
  return commonDao.queryForInsert(sql, args);
}

export function findPeersByCidAndGatewayId(cid: string, gatewayId: number) {
  return commonDao.queryForObj(
    'SELECT * from peers_info i join file_info f on f.id = i.file_info_id where f.cid = ? and i.gateway_id = ?',
    [cid, gatewayId]
  );
}
