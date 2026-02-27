// src/modules/users/users.repository.js
const db = require('../../config/db');

async function findByEmail(email) {
  const result = await db.query(
    `SELECT id, email, password_hash, role, token_version
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email]
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await db.query(
    `SELECT id, email, password_hash, role, token_version
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}

async function createUser({ email, passwordHash, role = 'user' }) {
  const result = await db.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING id, email, role, token_version`,
    [email, passwordHash, role]
  );
  return result.rows[0];
}

async function incrementTokenVersion(userId) {
  const result = await db.query(
    `UPDATE users
     SET token_version = token_version + 1,
         updated_at = NOW()
     WHERE id = $1
     RETURNING token_version`,
    [userId]
  );
  return result.rows[0] || null;
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  incrementTokenVersion,
};
