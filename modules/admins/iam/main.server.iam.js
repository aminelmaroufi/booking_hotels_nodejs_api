/* eslint-disable import/no-dynamic-require */
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const path = require('path');

const config = require(path.resolve('./config'));
const _ = require('lodash');

const ctrls = require('../controllers/main.server.controller');

// eslint-disable-next-line
// const utils = require('utils');

/**
 * @type { IAM.default }
 */
module.exports = {
  prefix: '/administrators',
  params: [
    {
      name: 'hotelId',
      middleware: ctrls.hotelByID,
    },
  ],
  routes: [
    {
      path: '/create',
      methods: {
        post: {
          iam: 'administrators:create',
          title: 'Create default admin',
          description: 'Create an administrator account if does not exist on the DB',
          middlewares: [ctrls.checkForAdminExistence, ctrls.createDefaultAdmin],
        },
      },
    },
    {
      path: '/hotels',
      methods: {
        get: {
          iam: 'hotels:list',
          title: 'Get Hotels',
          description: 'API to get hotels list by filter and pagination',
          middlewares: [ctrls.getHotelsList],
        },
        post: {
          iam: 'hotels:create',
          title: 'Create New Hotel',
          description: 'Admin: Create New Hotel',
          middlewares: [
            multer(
              _.extend(
                {
                  storage: new GridFsStorage({
                    url: config.db.uri,
                    file: (req, file) => ({
                      filename: file.originalname,
                    }),
                  }),
                },
                config.uploads.uploader,
              ),
            ).any(),
            ctrls.validate('createHotel'),
            ctrls.checkValidationResult,
            ctrls.create,
          ],
        },
      },
    },
    {
      path: '/hotels/:hotelId',
      methods: {
        delete: {
          iam: 'administrators:hotels:delete',
          title: 'Delete selected hotel',
          description: 'API to delete selected hotel by administrator',
          middlewares: [ctrls.deleteHotel],
        },
        put: {
          iam: 'hotel:update',
          title: 'update service',
          description: 'Update Hotel',
          middlewares: [
            multer(
              _.extend(
                {
                  storage: new GridFsStorage({
                    url: config.db.uri,
                    file: (req, file) => ({
                      filename: file.originalname,
                    }),
                  }),
                },
                config.uploads.uploader,
              ),
            ).any(),
            ctrls.validate('updateHotel'),
            ctrls.checkValidationResult,
            ctrls.updateHotel,
          ],
        },
      },
    },
    {
      path: '/hotels/:hotelId/rooms',
      methods: {
        post: {
          iam: 'rooms:create',
          title: 'Create New Room',
          description: 'Admin: Create New Room',
          middlewares: [
            multer(
              _.extend(
                {
                  storage: new GridFsStorage({
                    url: config.db.uri,
                    file: (req, file) => ({
                      filename: file.originalname,
                    }),
                  }),
                },
                config.uploads.uploader,
              ),
            ).any(),
            ctrls.validateRoom('createRoom'),
            ctrls.checkRoomValidationResult,
            ctrls.createRoom,
          ],
        },
      },
    },
    // {
    //   path: '/statistics',
    //   methods: {
    //     get: {
    //       iam: 'administrators:statistics',
    //       title: 'Get Statistics',
    //       description:
    //         'API to get a general statistics about barbers, customers, orders and amount',
    //       middlewares: [
    //         ctrls.getBarbersStats,
    //         ctrls.getCustomersStats,
    //         ctrls.getOrdersStats,
    //         ctrls.getbarbersAvailibleStats,
    //         ctrls.returnStats,
    //       ],
    //     },
    //   },
    // },
  ],
};
