// src/modules/auth/auth.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const usersRepo = require('../users/users.repository');
const authRepo = require('./auth.repository');

// Mantengo estas Maps exportadas solo por compatibilidad (ya no se usan).
// Puedes borrarlas después si confirmas que nadie las importa.
const usersByEmail = new Map();
const refreshTokens = new Map();

function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
}

function signRefreshToken(payload) {
  const refreshPayload = {
    ...payload,
    jti: crypto.randomUUID(),
  };

  return jwt.sign(refreshPayload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
}

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// hash estable para guardar refresh token en DB (no guardamos el token plano)
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function sanitizeUserDb(userRow) {
  if (!userRow) return null;
  // En DB se llama password_hash
  const { password_hash: _password_hash, ...safe } = userRow;
  return safe;
}

async function register({ email, password, role = 'user' }) {
  const normalizedEmail = String(email || '')
    .trim()
    .toLowerCase();
  if (!normalizedEmail) throw createError(400, 'Email is required');
  if (!password || String(password).length < 6) {
    throw createError(400, 'Password must be at least 6 characters');
  }

  const existing = await usersRepo.findByEmail(normalizedEmail);
  if (existing) throw createError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(password, 10);

  // ✅ DB: crear usuario
  await usersRepo.createUser({
    email: normalizedEmail,
    passwordHash,
    role,
  });

  // Necesitamos el user completo para token payload (incluye token_version)
  const user = await usersRepo.findByEmail(normalizedEmail);
  if (!user) throw createError(500, 'User creation failed');

  const tokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    tokenVersion: user.token_version,
  };

  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  // ✅ DB: guardar refresh token hasheado
  const decodedRefresh = jwt.decode(refreshToken); // { iat, exp, ... }
  const expiresAt = new Date(decodedRefresh.exp * 1000);
  await authRepo.createRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });

  return {
    user: sanitizeUserDb(user),
    tokens: { accessToken, refreshToken },
  };
}

async function login({ email, password }) {
  const normalizedEmail = String(email || '')
    .trim()
    .toLowerCase();
  if (!normalizedEmail) throw createError(400, 'Email is required');
  if (!password) throw createError(400, 'Password is required');

  const user = await usersRepo.findByEmail(normalizedEmail);
  if (!user) throw createError(401, 'Invalid credentials');

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw createError(401, 'Invalid credentials');

  const tokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    tokenVersion: user.token_version,
  };

  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  // ✅ DB: guardar refresh token hasheado
  const decodedRefresh = jwt.decode(refreshToken);
  const expiresAt = new Date(decodedRefresh.exp * 1000);
  await authRepo.createRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });

  return {
    user: sanitizeUserDb(user),
    tokens: { accessToken, refreshToken },
  };
}

// ✅ Verifica firma + existencia en DB (revocable)
async function verifyRefreshToken(refreshToken) {
  if (!refreshToken) throw createError(401, 'Refresh token required');

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw createError(401, 'Invalid refresh token');
  }

  const row = await authRepo.findRefreshTokenByHash(hashToken(refreshToken));
  if (!row || row.revoked_at) {
    throw createError(401, 'Refresh token revoked or unknown');
  }

  // exp del JWT ya fue validado por jwt.verify, pero dejamos esto como defensa extra:
  if (new Date(row.expires_at).getTime() < Date.now()) {
    throw createError(401, 'Refresh token expired');
  }

  return decoded;
}

// ✅ Refresh con rotación + ✅ valida tokenVersion contra el user actual (DB)
async function refresh(refreshToken) {
  if (!refreshToken) throw createError(401, 'Refresh token required');

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw createError(401, 'Invalid refresh token');
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await authRepo.findRefreshTokenByHash(tokenHash);

  if (!stored || stored.revoked_at) {
    throw createError(401, 'Refresh token revoked or unknown');
  }

  if (new Date(stored.expires_at).getTime() < Date.now()) {
    throw createError(401, 'Refresh token expired');
  }

  // ✅ user actual desde DB
  const user = await usersRepo.findById(decoded.sub);
  if (!user) {
    // limpieza defensiva: revocar token si el usuario ya no existe
    await authRepo.revokeRefreshToken({ tokenHash });
    throw createError(401, 'User not found');
  }

  // ✅ tokenVersion: si cambió, es logout-all o revocación global
  if (decoded.tokenVersion !== user.token_version) {
    await authRepo.revokeRefreshToken({ tokenHash });
    throw createError(401, 'Token revoked');
  }

  // ROTACIÓN:
  // 1) emitir nuevos tokens con tokenVersion actual
  const tokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    tokenVersion: user.token_version,
  };

  const newAccessToken = signAccessToken(tokenPayload);
  const newRefreshToken = signRefreshToken(tokenPayload);

  // 2) guardar nuevo refresh en DB
  const decodedNew = jwt.decode(newRefreshToken);
  const expiresAt = new Date(decodedNew.exp * 1000);

  const newRow = await authRepo.createRefreshToken({
    userId: user.id,
    tokenHash: hashToken(newRefreshToken),
    expiresAt,
  });

  // 3) revocar el refresh viejo y marcar replaced_by
  await authRepo.revokeRefreshToken({
    tokenHash,
    replacedBy: newRow.id,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

// ✅ Logout: revoca 1 refresh token (DB)
async function logout(refreshToken) {
  if (!refreshToken) throw createError(400, 'Refresh token required');

  const tokenHash = hashToken(refreshToken);
  const existing = await authRepo.findRefreshTokenByHash(tokenHash);

  if (!existing || existing.revoked_at) {
    throw createError(401, 'Refresh token already revoked or unknown');
  }

  await authRepo.revokeRefreshToken({ tokenHash });

  return { message: 'Logged out successfully' };
}

// ✅ logout global: incrementa tokenVersion + revoca todos los refresh tokens del usuario
async function logoutAll(userId) {
  const user = await usersRepo.findById(userId);
  if (!user) throw createError(404, 'User not found');

  await usersRepo.incrementTokenVersion(userId);
  await authRepo.revokeAllUserRefreshTokens(userId);

  return { message: 'Logged out from all sessions' };
}

module.exports = {
  register,
  login,
  verifyRefreshToken,
  refresh,
  logout,
  logoutAll,

  // compat (no usado ya)
  usersByEmail,
  refreshTokens,
};
