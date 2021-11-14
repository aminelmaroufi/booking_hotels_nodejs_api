// const { resolve } = require('path');
// const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
// const errorHandler = require('../../core/controllers/errors.server.controller');

const Hotel = mongoose.model('Hotel');

// eslint-disable-next-line
// const config = require(resolve('./config'));
// const validationsHelper = require(resolve('./config/validations'));

/**
 * Get Hotels List by Administrators
 * @param {IncommingMessage} req The request
 * @param {OutcommingMessage} res The response
 */
exports.getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find(
      { is_archived: false },
      'name short_address address location type main_picture second_picture rating rooms',
    )
      .sort('-created')
      .populate('rooms', 'title advantage price room_picture');

    res.json({ ok: true, result: { hotels } });
  } catch (err) {
    res.status(400).send({
      ok: false,
      result: {
        message: err,
      },
    });
  }
};
