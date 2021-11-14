/* eslint linebreak-style: ["error", "unix"] */
/* eslint-disable no-console */

// const mongoose = require('mongoose');

// const { ObjectId } = mongoose.Types;

/**
 *  Admin
 */
exports.admin = {
  roles: ['admin'],
  email: 'admin@admin.com',
  password: 'Azerty123@@',
  firstName: 'Admin',
  lastName: 'Admin',
  provider: 'local',
};

exports.adminSigin = {
  email: 'admin@admin.com',
  password: 'Azerty123@@',
};

/**
 *  User
 */
exports.user = {
  email: 'user@email.com',
  password: 'Azerty123@@',
  full_name: 'User FullName',
};
