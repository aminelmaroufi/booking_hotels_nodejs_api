/* eslint-disable import/no-dynamic-require */
const { resolve } = require('path');
const mongoose = require('mongoose');
const _ = require('lodash');

const Grid = mongoose.model('Grid');

const User = mongoose.model('User');
const Room = mongoose.model('Room');
const errorHandler = require('../../core/controllers/errors.server.controller');
// eslint-disable-next-line
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
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.all();

    return res.status(200).send({
      ok: true,
      result: {
        rooms,
      },
    });
  } catch (e) {
    return res.status(400).send({
      ok: false,
      result: {
        message: errorHandler.getErrorMessage(e),
      },
    });
  }
};

/**
 * Get Hotels List by Administrators
 * @param {IncommingMessage} req The request
 * @param {OutcommingMessage} res The response
 */
exports.getRoomsList = async (req, res) => {
  try {
    const hotels = await Room.find({ is_archived: false }).sort('-created');

    res.json({ ok: true, result: { data: hotels } });
  } catch (err) {
    res.status(400).send({
      ok: false,
      result: {
        message: errorHandler.getErrorMessage(err),
      },
    });
  }
};

/**
 * Get Hotel by ID
 * @param {IncommingMessage} req The request
 * @param {OutcommingMessage} res The response
 */
exports.roomByID = async (req, res, next, id) => {
  const resp = {
    ok: false,
    result: {
      message: '',
      data: {},
    },
  };

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      resp.result.message = req.t('ROOM_NOT_FOUND');
      return res.status(404).send(resp);
    }

    return Room.findById(id).exec((err, room) => {
      if (err || !room) {
        resp.result.message = req.t('ROOM_NOT_FOUND');
        return res.status(404).send(resp);
      }

      req.room = room;
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
exports.deleteRoom = async (req, res) => {
  const { room } = req;
  const resp = {
    ok: false,
    result: {
      message: '',
      data: {},
    },
  };
  let rooms;

  room.is_archived = true;

  try {
    await room.save();
    rooms = await Room.find({ is_archived: false });
  } catch (error) {
    resp.result.message = req.t('ERRORS_500');
    return res.status(500).json(resp);
  }

  resp.ok = true;
  resp.result.rooms = rooms;
  resp.result.message = req.t('ROOM_DELETED');
  return res.status(200).json(resp);
};

/**
 * Update the selected hotel
 * @param {IncommingMessage} req The request
 * @param {OutcommingMessage} res The response
 */
exports.updateRoom = async (req, res) => {
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
