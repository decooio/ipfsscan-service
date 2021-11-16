import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import {configs} from './config/index';
const path = require('path');
const Postgrator = require('postgrator');
const app = express();
import {router} from './routes/index';
import {
  fixUnknownSourceFiles,
  indexCrustFileInDb,
  indexFilePeersInDb,
  markAndFixFileInfos,
} from './service/indexService';
import {logger} from './logger';
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(router);
const postgrator = new Postgrator({
  migrationDirectory: path.join(__dirname, configs.evolution.location),
  schemaTable: configs.evolution.schema_table,
  driver: 'mysql2',
  host: configs.db.host,
  port: configs.db.port,
  database: configs.db.db,
  username: configs.db.user,
  password: configs.db.password,
});

postgrator.migrate('max').then((migrations: any) => {
  app.listen(configs.server.port);
  indexCrustFileInDb()
    .then(() => {})
    .catch(e => {
      logger.error(e.stack);
    });
  indexFilePeersInDb()
    .then(() => {})
    .catch(e => {
      logger.error(e.stack);
    });
  markAndFixFileInfos()
    .then(() => {})
    .catch(e => {
      logger.error(e.stack);
    });
  fixUnknownSourceFiles()
    .then(() => {})
    .catch(e => {
      logger.error(e.stack);
    });
});
