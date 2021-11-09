/**
 * @auther zhouzibo
 * @date 2021/9/6
 */
const NodeCache = require('node-cache');
export const cache = new NodeCache({stdTTL: 10, checkperiod: 120});

export const getEnv = (value: string, defaultValue: any): any => {
  return process.env[value] || defaultValue;
};
