/*
    custom Error
 */

module.exports = class AppError extends Error {
  constructor(message, status) {
    // Calling parent constructor of base Error class.
    super(message);

    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name;

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);

    // `500` is the default value if not specified.
    this.status = status || 500;
  }
};
