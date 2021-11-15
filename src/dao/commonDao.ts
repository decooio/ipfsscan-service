const _ = require('lodash');
import {sequelize} from '../db/db';
import {logger} from '../logger';

const commonDao = {
  queryForCount: queryForCount,
  queryForArray: queryForArray,
  queryForObj: queryForObj,
  queryForUpdate: queryForUpdate,
  queryForInsert: queryForInsert,
};

function queryForCount(sql: string, replace: any[]): Promise<number> {
  return sequelize
    .query(sql, {
      replacements: replace,
      type: sequelize.QueryTypes.SELECT,
      raw: true,
    })
    .then((r: any[]) => {
      if (!_.isEmpty(r)) {
        const res = r[0];
        return res[Object.keys(res)[0]];
      }
    });
}

function queryForArray(sql: string, replace: any[]): Promise<any[]> {
  return sequelize
    .query(sql, {
      replacements: replace,
      type: sequelize.QueryTypes.SELECT,
    })
    .then((r: any[]) => {
      if (!_.isEmpty(r)) {
        return r;
      }
      return [];
    });
}

function queryForObj(sql: string, replace: any[]): Promise<any> {
  return sequelize
    .query(sql, {
      replacements: replace,
      type: sequelize.QueryTypes.SELECT,
    })
    .then((r: any[]) => {
      if (!_.isEmpty(r)) {
        return r[0];
      }
      return {};
    });
}

function queryForUpdate(sql: string, replace: any[]): Promise<number> {
  return sequelize
    .query(sql, {
      replacements: replace,
      type: sequelize.QueryTypes.UPDATE,
    })
    .then((r: any) => {
      return 0;
    });
}

function queryForInsert(sql: string, replace: any[]): Promise<number> {
  return sequelize
    .query(sql, {
      replacements: replace,
      type: sequelize.QueryTypes.INSERT,
    })
    .then((r: any) => {
      return 0;
    });
}

module.exports = commonDao;
