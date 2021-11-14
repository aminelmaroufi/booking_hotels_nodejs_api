/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-dynamic-require */
const mongoose = require('mongoose');
const async = require('async');
const _ = require('lodash');
const { resolve } = require('path');

const config = require(resolve('./config'));
const { vendor } = config.files.server.modules;
// eslint-disable-next-line
const errorHandler = require(resolve(`./${vendor}/core/controllers/errors.server.controller`));
const Grid = mongoose.model('Grid');

exports.ls = (req, res) => {
  Grid
    .find({
      metadata: {
        owner: req.user._id,
      },
    })
    .paginate(req.query)
    .then((files) => res.json(files))
    .catch((err) => {
      res.status(400).send({
        message: errorHandler.getErrorMessage(err),
      });
    });
};
// eslint-disable-next-line
exports.upload = (req, res, next) => {
  const errors = [];

  if (req.fileValidationError) {
    const { extension } = req.fileValidationError;
    errors.push({ message: `L'extension ${extension} est non supportée` });
  }
  const files = Array.isArray(req.files) ? req.files : [];

  req.files = files;

  // test the number of distincts files uploaded
  let sDocsIds = req.files.map((f) => f.fieldname);
  sDocsIds = sDocsIds.filter((elem, pos, arr) => arr.indexOf(elem) === pos);

  // User should upload all files
  if (req.theRequest.to_provide.length !== sDocsIds.length || req.fileValidationError) {
    // delete uploaded files
    async.map(files, (f) => {
      const tmpF = f.file;
      Grid.findOne({ _id: tmpF._id }, (e, g) => {
        g.remove();
      });
    });
    if (req.theRequest.to_provide.length < 1) {
      return res.status(400).json({ message: req.t('NOTHING_TO_UPLOAD') });
    }
    if (req.theRequest.to_provide.length !== sDocsIds.length) {
      errors.push({ message: req.t('USER_SHOULD_UPLOAD_ALL_FILES') });
    }

    return res.status(400).json(errors);
  }

  async.map(files, (f, cb) => {
    const tmpF = f.file;
    Grid
      .findOne({
        _id: tmpF._id,
      })
      .then((f_) => {
        f_.set('metadata', { originalSDID: f.fieldname });
        return f_.save();
      })
      .then((f_) => {
        cb(null, f_);
      })
      .catch((err) => {
        cb(err);
      });
  }, (err, results) => {
    req.results = results;
    return next();
  });
};

exports.meta = (req, res) => {
  const f = req.gridFile;

  if (!req.body || typeof req.body !== 'object') {
    req.body = {};
  }

  const bMeta = _.extend({}, f.metadata, req.body.metadata, {
    owner: req.user._id,
  });

  f.set('metadata', bMeta);

  if (req.body.filename) {
    f.set('filename', req.body.filename);
  }

  f.save().then((f_) => {
    res.json(f_);
  })
    .catch((err) => {
      res.status(404).end(err);
    });
};

exports.one = (req, res) => {
  res.json(req.gridFile);
};

exports.remove = (req, res) => {
  req.gridFile.remove()
    .then(() => {
      res.status(204).end();
    })
    .catch((err) => {
      res.status(404).json(err);
    });
};

exports.fileById = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      ok: false,
      result: {
        message: 'ID not valid',
      },
    });
  }

  Grid
    .findOne({
      _id: req.params.id,
    })
    .then((f) => {
      if (!f) {
        return res.status(404).json({
          ok: false,
          result: {
            message: 'File not found',
          },
        });
      }

      req.gridFile = f;
      return next();
    })
    .catch((err) => next(err));
};

exports.download = (isDownload) => (req, res) => {
  const { gfs } = req.app.locals;

  Grid.findOne({
    _id: req.params.id,
  }, (err, f) => {
    if (err) {
      errorHandler(err);
      return;
    }

    if (!f) {
      res.status(404).send('File not found');
      return;
    }

    if (isDownload === true) {
      res.header('Content-Type', 'application/octet-stream');
      res.header('Content-Disposition', `attachement; filename=${encodeURI(f.get('filename'))}`);
    } else {
      res.header('Content-Type', f.get('contentType'));
      res.header('Content-Disposition', `inline; filename=${encodeURI(f.get('filename'))}`);
    }

    const stream = gfs.createReadStream({
      _id: req.params.id,
    });

    stream.pipe(res);
  });
};

// eslint-disable-next-line
exports.uploadFile = (req, res, next) => {
  const errors = [];
  if (req.fileValidationError) {
    const { extension } = req.fileValidationError;
    errors.push({ message: `L'extension ${extension} est non supportée` });
    return res.status(400).json(errors);
  }
  req.typeFile = req.files[0].fieldname;
  const files = Array.isArray(req.files) ? req.files : [];
  req.files = files;
  async.map(files, (f, cb) => {
    const tmpF = f.file;
    Grid
      .findOne({
        _id: tmpF._id,
      })
      .then((f_) => {
        f_.set('metadata', {
          org: req.organization._id,
          type: f.fieldname,
        });
        return f_.save();
      })
      .then((f_) => {
        cb(null, f_);
      })
      .catch((err) => {
        cb(err);
      });
  }, (err, results) => {
    req.results = results;
    return next();
  });
};
