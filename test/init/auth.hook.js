/* eslint linebreak-style: ["error", "unix"] */
/* eslint-disable no-console */
/* eslint-disable no-undef */

const supertest = require('supertest');
const target = require('./target');
const globalCookie = require('./cookie');

const request = supertest(target.host);

exports.signin = (data) => {
  before('Signin', (done) => {
    request
      .post('/api/v1/auth/signin')
      .send(data)
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.log('SIGNIN ERROR:', err);
          return done(err);
        }
        globalCookie.setCookie(res.headers['set-cookie']);
        return done();
      });
  });
};

exports.signout = (gotenCookie, callback) => {
  request
    .post('/api/v1/auth/signout')
    .set('Cookie', gotenCookie)
    .expect(200)
    .end((err, res) => {
      if (err || !res.ok) {
        console.log('SIGNOUT ERROR:', err);
        return callback(err);
      }

      console.log('SIGNOUT SUCCESS:', res);
      globalCookie.setCookie([]);
      return callback();
    });
};
