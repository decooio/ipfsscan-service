import * as express from 'express';
import {cache} from '../common/commonUtils';
import {query, body, param} from 'express-validator';
import {queryAll, queryById} from '../dao/gatewayDao';
import {Failure, FailureError} from '../models/Failure';
import {findprovs} from '../service/ipfsService';
import {logger} from '../logger';
import {upsertFileAccessTime} from '../dao/fileInfoDao';
import {FileSource} from '../models/FileInfo';
const _ = require('lodash');
const validate = require('../handlers/validationHandler');
export const router = express.Router();

router.get('/gateway/all', (req, res) => {
  queryAll().then((r: any) => {
    res.json(
      _.map(r, (i: any) => {
        return _.omit(i, ['api_password']);
      })
    );
  });
});

router.post(
  '/ipfs/dht/findprovs',
  validate([
    body('cid').isString().isLength({max: 59, min: 46}),
    body('gatewayId')
      .isInt()
      .custom((id: any, {req}) => {
        const cacheKey = `GATEWAY_${id}`;
        const gateway = cache.get(cacheKey);
        if (gateway === undefined) {
          return queryById(id).then((r: any) => {
            if (_.isEmpty(r)) {
              return Promise.reject('Invalid gateway id');
            } else {
              cache.set(cacheKey, r);
              req.body.gateway = r;
            }
          });
        } else {
          req.body.gateway = gateway;
          return true;
        }
      }),
  ]),
  async (req, res) => {
    await upsertFileAccessTime(req.body.cid, FileSource.unknown);
    findprovs(req.body.cid, req.body.gateway.baseUrl, req.body.gateway.id)
      .then(r => {
        res.json(r);
      })
      .catch((e: Error) => {
        logger.error(
          `findprovs from ${req.body.gateway.baseUrl} failed: ${e.stack}`
        );
        res
          .status(500)
          .json(new Failure(new FailureError('findprovs failed', e.message)));
      });
  }
);
