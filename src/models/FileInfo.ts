import * as Sequelize from 'sequelize';
import {sequelize} from '../db/db';
const _ = require('lodash');

export const FileInfos = sequelize.define(
  'file_info',
  {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    cid: {
      type: Sequelize.STRING(64),
      allowNull: false,
    },
    storage_key: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    expired_at: {
      type: Sequelize.BIGINT,
      allowNull: true,
    },
    calculated_at: {
      type: Sequelize.BIGINT,
      allowNull: true,
    },
    create_time: Sequelize.DATE,
    update_time: Sequelize.DATE,
    access_time: Sequelize.DATE,
    source: Sequelize.INTEGER,
  },
  {
    timestamps: false,
    tableName: 'file_info',
  }
);

export class FileInfo {
  id?: number;
  cid: string;
  storage_key?: string;
  expired_at?: number;
  calculated_at?: number;
  create_time?: number;
  update_time?: number;
  access_time?: number;
  source: number;
  need_index: number;

  constructor(
    cid: string,
    key: string,
    expired_at: number,
    calculated_at: number,
    source: FileSource = FileSource.crust,
    need_index: FileNeedIndex = FileNeedIndex.yes
  ) {
    this.cid = cid;
    this.storage_key = key;
    this.expired_at = expired_at;
    this.calculated_at = calculated_at;
    this.source = source;
    this.need_index = FileNeedIndex.yes;
  }

  static parseCrustFile(cf: CrustFileInfo, cid: string, key: string): FileInfo {
    return new FileInfo(cid, key, cf.expired_at, cf.calculated_at);
  }
}

export interface CrustFileInfo {
  file_size: number;
  expired_at: number;
  calculated_at: number;
  amount: number;
  prepaid: number;
  reported_replica_count: number;
  replicas: [any];
}

export enum FileSource {
  crust = 0,
  others = 1,
  unknown = 2,
}

export enum FileNeedIndex {
  yes = 0,
  no = 1,
}
