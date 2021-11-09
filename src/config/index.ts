const {getEnv} = require('../common/commonUtils');
const _ = require('lodash');

export const configs = {
  db: {
    host: getEnv('MYSQL_HOST', 'localhost'),
    port: _.parseInt(getEnv('MYSQL_PORT', 3306)),
    db: getEnv('MYSQL_DB', 'ipfs_scan'),
    user: getEnv('MYSQL_USER', 'root'),
    password: getEnv('MYSQL_PASSWORD', 'root'),
    db_pool_max: _.parseInt(getEnv('MYSQL_POOL_MAX', 10)),
    db_pool_min: _.parseInt(getEnv('MYSQL_POOL_MIN', 0)),
    db_pool_idle: _.parseInt(getEnv('MYSQL_POOL_IDLE', 30000)),
    db_pool_acquire: _.parseInt(getEnv('MYSQL_POOL_ACQUIRE', 30000)),
  },
  ipfs: {
    delegates: [] as string[],
    NUM_PROVIDERS: _.parseInt(getEnv('NUM_PROVIDERS', 20)),
    IPFS_AUTH_USERNAME: getEnv('IPFS_AUTH_USERNAME', 'ghost'),
    IPFS_AUTH_PASSWORD: getEnv('IPFS_AUTH_PASSWORD', 'ghost'),
    IPFS_HTTP_TIMEOUT: _.parseInt(getEnv('IPFS_HTTP_TIMEOUT', 180000)),
    CACHE_TTL: _.parseInt(getEnv('CACHE_TTL', 60 * 60 * 24)),
  },
  evolution: {
    schema_table: 'data_migrations',
    location: '/migrations',
  },
  server: {
    port: 3000,
    name: getEnv('NODE_ENV', 'prod'),
  },
};