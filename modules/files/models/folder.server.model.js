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

/**
 * File Schema
 */
const FolderSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill File name',
    trim: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  owner: {
    type: Schema.ObjectId,
    ref: 'User',
  },
  files: [{
    type: Schema.ObjectId,
  }],
  parent: {
    type: Schema.ObjectId,
    ref: 'Folder',
  },
}, {
  timestamps: config.lib.mongoose.timestamps,
});

mongoose.model('Folder', FolderSchema);
