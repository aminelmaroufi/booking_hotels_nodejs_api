const EventEmitter = require('events');

class Emitter extends EventEmitter {}

const event_emitter = new Emitter();

module.exports = event_emitter;
