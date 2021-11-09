const commonDao = require('./commonDao');

export function queryAll() {
  return commonDao.queryForArray('select * from gateway where deleted = 0');
}

export function queryById(id: Number) {
  return commonDao.queryForObj(
    'select * from gateway where deleted = 0 and id = ?',
    [id]
  );
}
