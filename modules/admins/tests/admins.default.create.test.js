/* eslint-disable no-console */
// const mocha = require('mocha');

// const { describe, it } = mocha;
// const middleware = require('middleware'); // the Middleware you want to test
const httpMocks = require('node-mocks-http'); // quickly sets up REQUEST and RESPONSE to be passed into Express Middleware
const mongoose = require('mongoose');

let checkForAdminExistence;

let req = {}; // define REQUEST
let res = {}; // define RESPONSE

// const defaultRes = {
//   ok: false,
//   result: {
//     message: req.t('ADMIN_ALREADY_EXIST'),
//   },
// };

describe('Check for admin existance middleware', async () => {
  beforeEach((done) => {
    mongoose.connect('mongodb://localhost:27017/app-test');
    mongoose.connection
      .once('open', () => console.log('Connected!'))
      .on('error', (error) => {
        console.warn('Error : ', error);
      });
    // eslint-disable-next-line global-require
    checkForAdminExistence = require('../controllers/main.server.controller').checkForAdminExistence;
    /*
     * before each test, reset the REQUEST and RESPONSE variables
     * to be send into the middle ware
    * */
    req = httpMocks.createRequest({
      method: 'POST',
      url: '/administrations/create',
    });
    res = httpMocks.createResponse();

    done(); // call done so that the next test can run
  });
  it('Should return false if a default admin exist in db', async (done) => {
    console.log('rejdehdkjs:');
    const result = await checkForAdminExistence(req, res, done);
    console.log('res:', result);
  });
});
