/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-dynamic-require */

/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const path = require('path');

const {
  Schema,
} = mongoose;
const config = require(path.resolve('./config'));

const gridSchema = new Schema({}, {
  strict: false,
}, {
  timestamps: config.lib.mongoose.timestamps,
});

gridSchema.virtual('preview').get(function get_preview() {
  return `/api/files/${this._id}/view`;
});

module.exports = mongoose.model('Grid', gridSchema, 'fs.files');
