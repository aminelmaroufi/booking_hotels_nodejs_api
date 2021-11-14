// const path = require('path');
// const _ = require('lodash');

// eslint-disable-next-line import/no-dynamic-require
// const config = require(path.resolve('./config'));

const ctrls = require('../controllers/main.server.controller');
const ctrlAdmin = require('../../admins/controllers/main.server.controller');

// eslint-disable-next-line
// const utils = require('utils');

/**
 * @type { IAM.default }
 */
module.exports = {
  prefix: '/hotels',
  params: [
    {
      name: 'hotelId',
      middleware: ctrlAdmin.hotelByID,
    },
  ],
  routes: [
    {
      path: '/',
      methods: {
        get: {
          iam: 'users:hotels:get',
          title: 'Get Hotels list',
          description: 'API to get the list of available hotels',
          middlewares: [ctrls.getHotels],
        },
      },
    },
  ],
};
