/* eslint-disable import/no-dynamic-require */

const multer = require('multer');
const _ = require('lodash');
const path = require('path');
// eslint-disable-next-line
const gridfsStorage = require("multer-gridfs-storage");

const config = require(path.resolve('./config'));
const ctrl = require('../controllers/main.server.controller');

module.exports = {
  prefix: '/files',
  params: [{
    name: 'id',
    middleware: ctrl.fileById,
  }],
  routes: [{
    path: '/',
    methods: {
      post: {
        middlewares: [
          multer(_.extend({
            storage: gridfsStorage({
              url: config.db.uri,
              file: (req, file) => ({
                filename: file.originalname,
              }),
            }),
          }, config.uploads.uploader)).any(),
          ctrl.upload,
        ],
        iam: 'files:upload',
      },
      get: {
        middlewares: [
          ctrl.ls,
        ],
        iam: 'files:list',
      },
    },
  }, {
    path: '/:id',
    methods: {
      get: {
        middlewares: [
          ctrl.one,
        ],
        iam: 'files:meta:get',
      },
      put: {
        middlewares: [
          ctrl.meta,
        ],
        iam: 'files:meta:edit',
      },
      post: {
        middlewares: [
          ctrl.meta,
        ],
        iam: 'files:meta:edit',
      },
      delete: {
        middlewares: [
          ctrl.remove,
        ],
        iam: 'files:delete',
      },
    },
  }, {
    path: '/:id/download',
    methods: {
      get: {
        middlewares: [
          ctrl.download(true),
        ],
        iam: 'files:download',
      },
    },
  }, {
    path: '/:id/view',
    methods: {
      get: {
        middlewares: [
          ctrl.download(false),
        ],
        iam: 'files:view',
      },
    },
  }],
};
