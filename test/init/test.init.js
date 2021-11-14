/* eslint linebreak-style: ["error", "unix"] */
/* eslint-disable no-console */
/* eslint-disable no-undef */

const db = require('./db.hook');
const target = require('./target');
const crud = require('./data.crud');
const data = require('./data.init');

db.connection(target.db);

before('Create Admin user', (done) => {
  crud.createDefaultAdmin(data.admin, done);
});

// after('Clean User collection', (done) => {
//   crud.cleanUser(done);
// });

after('Clean database ', (done) => {
  crud.clean(done);
});

db.disconnection();
