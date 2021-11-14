/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const path = require('path');
// eslint-disable-next-line
const config = require(path.resolve('./config'));

const { Schema } = mongoose;

const RoomSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    advantage: {
      type: String,
      required: true,
    },
    room_picture: {
      ref: 'Grid',
      type: 'ObjectId',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    // hotel: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'Hotel',
    // },
  },
  {
    timestamps: config.lib.mongoose.timestamps,
  },
);

module.exports = mongoose.model('Room', RoomSchema);
