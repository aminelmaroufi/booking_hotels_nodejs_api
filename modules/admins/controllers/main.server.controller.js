/* eslint-disable no-console */
/* eslint-disable import/no-dynamic-require */
const { resolve } = require('path');
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');
const _ = require('lodash');

const Grid = mongoose.model('Grid');
const User = mongoose.model('User');
const Hotel = mongoose.model('Hotel');
const Room = mongoose.model('Room');
const errorHandler = require(resolve('./modules/core/controllers/errors.server.controller'));

const config = require(resolve('./config'));
const validationsHelper = require(resolve('./config/validations'));

/**
 * Create a default administration
 * @param {IncommingMessage} req The request
 * @param {OutcommingMessage} res The response
 */
exports.createDefaultAdmin = async (req, res) => {
  const { defaultAdmin } = config;
  const { hooks } = validationsHelper;
  try {
    const admin = new User(defaultAdmin);
    await hooks.onInit(admin);
    admin.validations[0].validated = true;
    await admin.save();
  } catch (e) {
    return res.status(400).send({
      ok: false,
      result: {
        message: errorHandler.getErrorMessage(e),
      },
    });
  }
  return res.status(200).send({
    ok: true,
    result: {
      message: req.t('ADMIN_CREATED'),
    },
  });
};

/**
 * Test if existe an admin
 * @param {IncommingMessage} req The request
 * @param {OutcommingMessage} res The response
 * @param {Function} next Go to the next middleware
 */
exports.checkForAdminExistence = async (req, res, next) => {
  try {
    console.log('entered:');
    const admins = await User.find({
      roles: { $in: ['admin'] },
    });
    if (admins && admins.length > 0) {
      return res.status(400).send({
        ok: false,
        result: {
          message: req.t('ADMIN_ALREADY_EXIST'),
        },
      });
    }
  } catch (e) {
    return res.status(400).send({
      ok: false,
      result: {
        message: errorHandler.getErrorMessage(e),
      },
    });
  }
  return next();
};

exports.validate = (method) => {
  switch (method) {
    case 'createHotel': {
      return [
        check('name', 'name is required').exists(),
        check('rating', 'Rating is required').exists(),
        check('rating', 'Rating must be an integer').isInt(),
        check('short_address', 'short_address is required').exists(),
        check('address', 'address is required').exists(),
        check('location', 'location is required').exists(),
        check('type', 'location is required').exists(),
      ];
    }
    case 'updateHotel': {
      return [
        check('name', 'name is required').exists(),
        check('rating', 'Rating is required').exists(),
        check('rating', 'Rating must be an integer').isInt(),
        check('main_picture', 'main_picture is required').exists(),
        check('second_picture', 'second_picture is required').exists(),
        check('short_address', 'short_address is required').exists(),
        check('address', 'address is required').exists(),
        check('location', 'location is required').exists(),
        check('type', 'location is required').exists(),
      ];
    }
    default:
      return null;
  }
};

exports.checkValidationResult = async (req, res, next) => {
  const main_picture = req.files ? req.files.filter((f) => f.fieldname === 'main_pic') : [];
  const second_picture = req.files ? req.files.filter((f) => f.fieldname === 'second_pic') : [];

  if (!main_picture.length) {
    return res.status(400).json({
      ok: false,
      result: { message: 'hotel main picture is required', data: {} },
    });
  }

  if (!second_picture.length) {
    return res.status(400).json({
      ok: false,
      result: { message: 'hotel second picture is required', data: {} },
    });
  }
  // Finds the validation errors in this request and wraps them in an object with handy functions
  let errors = validationResult(req);

  if (errors.isEmpty()) return next();

  errors = errors.array();

  return res.status(400).json({
    ok: false,
    result: {
      message: errors[0].msg,
      data: {},
    },
  });
};

exports.create = async (req, res) => {
  const { name, rating, short_address, address, location, type } = req.body;
  const hotel = {
    name,
    rating: parseInt(rating, 10),
    short_address,
    address,
    location,
    type,
    main_picture: req.files[0].id,
    second_picture: req.files[1].id,
  };

  let newHotel = new Hotel(hotel);

  try {
    newHotel = await newHotel.save();
  } catch (error) {
    return res.status(400).json({
      ok: false,
      result: { message: errorHandler.getErrorMessage(error), data: {} },
    });
  }

  return res.status(200).json({
    ok: true,
    result: {
      message: req.t('Hotel Created'),
      data: newHotel.toJSON({ virtuals: true }),
    },
  });
};

/**
 * Get Hotels List by Administrators
 * @param {IncommingMessage} req The request
 * @param {OutcommingMessage} res The response
 */
exports.getHotelsList = async (req, res) => {
  try {
    const hotels = await Hotel.find({ is_archived: false }).sort('-created');
    // .populate('rooms', 'title advantage price room_picture');

    res.json({ ok: true, result: { data: hotels } });
  } catch (err) {
    res.status(400).send({
      ok: false,
      result: {
        message: err,
      },
    });
  }
};

/**
 * Get Hotel by ID
 * @param {IncommingMessage} req The request
 * @param {OutcommingMessage} res The response
 */
exports.hotelByID = async (req, res, next, id) => {
  const resp = {
    ok: false,
    result: {
      message: '',
      data: {},
    },
  };

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      resp.result.message = req.t('HOTEL_NOT_FOUND');
      return res.status(404).send(resp);
    }

    return Hotel.findById(id).exec((err, hotel) => {
      if (err || !hotel) {
        resp.result.message = req.t('HOTEL_NOT_FOUND');
        return res.status(404).send(resp);
      }

      req.hotel = hotel;
      return next();
    });
  } catch (err) {
    resp.result.message = errorHandler.getErrorMessage(err);
    return res.status(404).send(resp);
  }
};

/**
 * Delet Hotel
 * @param {IncommingMessage} req The request
 * @param {OutcommingMessage} res The response
 */
exports.deleteHotel = async (req, res) => {
  const { hotel } = req;
  const resp = {
    ok: false,
    result: {
      message: '',
      data: {},
    },
  };
  let hotels;

  hotel.is_archived = true;

  try {
    await hotel.save();
    hotels = await Hotel.find({ is_archived: false });
  } catch (error) {
    resp.result.message = req.t('ERRORS_500');
    return res.status(500).json(resp);
  }

  resp.ok = true;
  resp.result.data = hotels;
  resp.result.message = req.t('HOTEL_DELETED');
  return res.status(200).json(resp);
};

/**
 * Update the selected hotel
 * @param {IncommingMessage} req The request
 * @param {OutcommingMessage} res The response
 */
exports.updateHotel = async (req, res) => {
  const { files } = req;
  let { hotel } = req;

  files.map(async (file) => {
    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
      const f = await Grid.findOne({ _id: file.id });

      if (f) {
        f.remove()
          .then(() => {
            res.status(400).json({
              ok: false,
              result: {
                message: req.t(
                  `${
                    file.filename === 'updated_main_picture' ? 'Main picture' : 'Second picture'
                  } FILE_EXTENTION_NOT_SUPPORTED`,
                ),
              },
            });
          })
          .catch((err) => {
            res.status(400).json({
              ok: false,
              result: {
                message: errorHandler.getErrorMessage(err),
              },
            });
          });
      }
    }
  });
  try {
    if (files.length) {
      const main_picture = files ? files.filter((f) => f.fieldname === 'updated_main_picture') : [];
      const second_picture = req.files
        ? files.filter((f) => f.fieldname === 'updated_second_picture')
        : [];

      if (main_picture) {
        const f = await Grid.findOne({ _id: req.body.main_picture });
        await f.remove();
        req.body.main_picture = files[0].id;
      }

      if (second_picture) {
        const m = await Grid.findOne({ _id: req.body.second_picture });
        await m.remove();
        req.body.second_picture = req.files[1].id;
      }
    }
    // Merge existing user
    hotel = _.merge(hotel, req.body);
    hotel = await hotel.save();

    return res.json({
      ok: true,
      result: {
        message: req.t('HOTEL_UPDATED'),
        data: hotel.toJSON({ virtuals: true }),
      },
    });
  } catch (err) {
    return res.status(400).send({
      ok: false,
      result: {
        message: errorHandler.getErrorMessage(err),
      },
    });
  }
};

/**
 * Validate new room data
 * @param {IncommingMessage} req The request
 * @param {OutcommingMessage} res The response
 */
exports.validateRoom = (method) => {
  switch (method) {
    case 'createRoom': {
      return [
        check('title', 'name is required').exists(),
        check('advantage', 'Advantage is required').exists(),
        check('price', 'Rating must be an integer').isInt(),
      ];
    }
    case 'updateRoom': {
      return [
        check('title', 'name is required').exists(),
        check('advantage', 'Rating is required').exists(),
        check('price', 'Rating must be an integer').isInt(),
        check('room_picture', 'main_picture is required').exists(),
      ];
    }
    default:
      return null;
  }
};

exports.checkRoomValidationResult = async (req, res, next) => {
  const room_picture = req.files ? req.files.filter((f) => f.fieldname === 'room_picture') : [];
  if (!room_picture.length) {
    return res.status(400).json({
      ok: false,
      result: { message: 'Room picture is required', data: {} },
    });
  }

  // Finds the validation errors in this request and wraps them in an object with handy functions
  let errors = validationResult(req);

  if (errors.isEmpty()) return next();

  errors = errors.array();

  return res.status(400).json({
    ok: false,
    result: {
      message: errors[0].msg,
      data: {},
    },
  });
};

exports.createRoom = async (req, res) => {
  const { hotel } = req;
  const { title, advantage, price } = req.body;
  const room = {
    title,
    price: parseInt(price, 10),
    advantage,
    room_picture: req.files[0].id,
    // hotel: hotel.id,
  };

  let newRoom = new Room(room);

  try {
    newRoom = await newRoom.save();
    hotel.rooms.push(newRoom.id);
    newRoom.hotel = await hotel.save();
  } catch (error) {
    return res.status(400).json({
      ok: false,
      result: { message: errorHandler.getErrorMessage(error), data: {} },
    });
  }
  return res.status(200).json({
    ok: true,
    result: {
      message: req.t('Room Created'),
      data: newRoom.toJSON({ virtuals: true }),
    },
  });
};
