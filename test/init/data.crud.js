/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-dynamic-require */
/* eslint linebreak-style: ["error", "unix"] */
/* eslint-disable no-console */
const { resolve } = require('path');
const mongoose = require('mongoose');

require('../../vendor/users/models/user.server.model');
require('../../modules/hotel/models/hotel.server.model');
require('../../modules/room/models/room.server.model');

const User = mongoose.model('User');
const Hotel = mongoose.model('Hotel');
const validationsHelper = require(resolve('./config/validations'));

/**
 *  Database
 */
exports.clean = (callback) => {
  mongoose.connection.db.dropDatabase(() => callback());
};

/**
 *  Create default admin
 */
exports.createDefaultAdmin = async (data, callback) => {
  const { hooks } = validationsHelper;
  try {
    const admin = new User(data);
    await hooks.onInit(admin);
    admin.validations[0].validated = true;
    await admin.save();
  } catch (e) {
    return callback(e);
  }
  return callback;
};

/**
 *  User CRUD
 */

exports.createUser = (data, callback) => {
  User.insertMany(data, (err, res) => {
    if (err) return callback(err);
    return callback(res);
  });
};

exports.cleanUser = (callback) => {
  User.remove({}, (err, res) => {
    if (err) return callback(err);
    return callback(res);
  });
};

exports.cleanExtendedUser = (callback) => {
  User.remove(
    {
      email: {
        $nin: ['atop.kutz.admin.email@gmail.com', 'top.kutz.not.admin.email@gmail.com'],
      },
    },
    (err, res) => {
      if (err) return callback(err);
      return callback(res);
    },
  );
};

exports.createExtendedUser = (collection, user, extendedUser) => User.insertMany(user)
  .then((createdUser) => {
    const _extendedUser = extendedUser;
    _extendedUser.user = createdUser[0]._id;
    return Promise.all([createdUser, collection.insertMany(_extendedUser)]);
  })
  .then((createdEntity) => createdEntity[1][0]._id)
  .catch((err) => err);

exports.findUserByMAil = async (email) => {
  const user = await User.findOne({ email }, (err, res) => {
    if (err) return err;
    return res._id;
  });
  console.log('user._id ', user._id);
  return user._id;
};

/**
 *  Hotel CRUD
 */

exports.createHotel = (data, callback) => {
  Hotel.insertMany(data, (err, res) => {
    if (err) return callback(err);
    return callback(res);
  });
};

exports.cleanHotel = (callback) => {
  Hotel.remove({}, (err) => {
    if (err) return callback(err);
    return callback();
  });
};
