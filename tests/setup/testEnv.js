const path = require('path');

process.env.NODE_ENV = 'test';

require('dotenv').config({
  path: path.resolve(process.cwd(), '.env.test'),
});

const { resetDb } = require('./dbReset');

// eslint-disable-next-line no-undef
beforeEach(async () => {
  await resetDb();
});
const db = require('../../src/config/db');

// eslint-disable-next-line no-undef
afterAll(async () => {
  await db.pool.end();
});
