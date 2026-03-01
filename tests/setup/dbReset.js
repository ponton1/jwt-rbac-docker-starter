// tests/setup/dbReset.js
const db = require('../../src/config/db');

async function resetDb() {
  // Limpia tablas en orden seguro (por FK cascade).
  await db.query('TRUNCATE refresh_tokens, users RESTART IDENTITY CASCADE;');
}

module.exports = { resetDb };
