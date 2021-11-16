import {configs} from '../config';

/**
 * @auther zhouzibo
 * @date 2021/9/6
 */
const NodeCache = require('node-cache');
import * as dayjs from 'dayjs';
export const cache = new NodeCache({stdTTL: 10, checkperiod: 120});

export const getEnv = (value: string, defaultValue: any): any => {
  return process.env[value] || defaultValue;
};

export function getTimestamp(): number {
  return dayjs().unix();
}

export function getDateTime(): string {
  return dayjs().format('YYYY-MM-DD HH:mm:ss');
}

export function sleep(time: number) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}
