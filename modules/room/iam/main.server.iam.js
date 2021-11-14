/* eslint-disable import/no-dynamic-require */

// const multer = require('multer');
// const gridfsStorage = require('multer-gridfs-storage');
// const path = require('path');
// const _ = require('lodash');

// const config = require(path.resolve('./config'));

const ctrls = require('../controllers/main.server.controller');

// eslint-disable-next-line
// const utils = require('utils');

/**
 * @type { IAM.default }
 */
module.exports = {
  prefix: '/rooms',
  params: [
    // {
    //   name: 'hotelId',
    //   middleware: ctrls.barberByID,
    // },
  ],
  routes: [
    {
      path: '/rooms',
      methods: {
        get: {
          iam: 'rooms:get',
          title: 'Get Rooms',
          description:
            'API to get a general statistics about barbers, customers, orders and amount',
          middlewares: [ctrls.getRooms],
        },
      },
    },
    // {
    //   path: '/hotels',
    //   methods: {
    //     get: {
    //       iam: 'administrators:hotels:list',
    //       title: 'Get Hotels',
    //       description: 'API to get hotels list by filter and pagination',
    //       middlewares: [ctrls.getHotelsList],
    //     },
    //   },
    // },
  ],
};
