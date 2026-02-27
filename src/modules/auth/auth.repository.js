// src/modules/auth/auth.repository.js
const db = require('../../config/db');

async function createRefreshToken({ userId, tokenHash, expiresAt }) {
  const result = await db.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, token_hash, expires_at, revoked_at, replaced_by, created_at`,
    [userId, tokenHash, expiresAt]
  );
  return result.rows[0];
}

async function findRefreshTokenByHash(tokenHash) {
  const result = await db.query(
    `SELECT id, user_id, token_hash, expires_at, revoked_at, replaced_by
     FROM refresh_tokens
     WHERE token_hash = $1
     LIMIT 1`,
    [tokenHash]
  );
  return result.rows[0] || null;
}

async function revokeRefreshToken({ tokenHash, replacedBy = null }) {
  const result = await db.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW(),
         replaced_by = $2
     WHERE token_hash = $1
     AND revoked_at IS NULL
     RETURNING id`,
    [tokenHash, replacedBy]
  );
  return result.rows[0] || null;
}

async function revokeAllUserRefreshTokens(userId) {
  await db.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE user_id = $1
     AND revoked_at IS NULL`,
    [userId]
  );
}

module.exports = {
  createRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
};
