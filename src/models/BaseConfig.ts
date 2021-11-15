import * as Sequelize from 'sequelize';
import {sequelize} from '../db/db';
const _ = require('lodash');

export const BaseConfig = sequelize.define(
  'base_config',
  {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    base_key: {
      type: Sequelize.STRING(64),
      allowNull: false,
    },
    base_value: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    create_time: Sequelize.DATE,
    update_time: Sequelize.DATE,
  },
  {
    timestamps: false,
    tableName: 'base_config',
  }
);
