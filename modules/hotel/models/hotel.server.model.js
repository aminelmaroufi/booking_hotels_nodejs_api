/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const path = require('path');
// eslint-disable-next-line
const config = require(path.resolve('./config'));

const { Schema } = mongoose;

const HotelSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    main_picture: {
      type: Schema.Types.ObjectId,
      ref: 'fs.files',
    },
    second_picture: {
      type: Schema.Types.ObjectId,
      ref: 'fs.files',
    },
    short_address: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    is_archived: {
      type: Boolean,
      default: false,
    },
    rooms: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Room',
      },
    ],
  },
  {
    timestamps: config.lib.mongoose.timestamps,
  },
);

module.exports = mongoose.model('Hotel', HotelSchema);
