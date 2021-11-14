/* eslint-disable consistent-return */
/* eslint linebreak-style: ["error", "unix"] */
/* eslint-disable no-console */
/* eslint-disable no-undef */

const mongoose = require('mongoose');

exports.connection = (db) => {
  before('Mongoose open connection', (done) => {
    console.log('connection test===');
    if (mongoose.connection.db) return done();
    mongoose
      .connect(db)
      .then(() => {
        console.log('connection success with db');
        return done();
      })
      .catch((err) => {
        console.log('connection failed with db:', err);
        return done(err);
      });
  });
};

exports.disconnection = () => {
  after('mongoose close connection', (done) => {
    mongoose.connection.close((err) => {
      if (err) return done(err);
      console.log('\nDisconnected from database\n');
      return done();
    });
  });
};
