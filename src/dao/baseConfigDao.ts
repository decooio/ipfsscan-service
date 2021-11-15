import {getTimestamp} from '../common/commonUtils';
const commonDao = require('./commonDao');
import {BaseConfig} from '../models/BaseConfig';

export async function queryValue(key: string) {
  const config = await BaseConfig.findOne({
    where: {
      base_key: key,
    },
  });
  return config ? config.base_value : null;
}

export async function saveValue(key: string, value: string) {
  const config = await BaseConfig.findOne({
    where: {
      base_key: key,
    },
  });
  if (config) {
    await BaseConfig.update(
      {base_value: value, update_time: getTimestamp()},
      {
        where: {
          id: config.id,
        },
      }
    );
  } else {
    await BaseConfig.create({
      base_key: key,
      base_value: value,
    });
  }
}
