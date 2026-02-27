// src/modules/auth/auth.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// In-memory stores (temporal). Luego se reemplaza por DB sin tocar routes/controllers.
const usersByEmail = new Map(); // email -> user
const refreshTokens = new Map(); // refreshToken -> { sub, email, role, tokenVersion }
function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
}

function sanitizeUser(user) {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function cryptoId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `u_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  }
}

function findUserById(userId) {
  return Array.from(usersByEmail.values()).find((u) => u.id === userId);
}

async function register({ email, password, role = 'user' }) {
  const normalizedEmail = String(email || '')
    .trim()
    .toLowerCase();
  if (!normalizedEmail) throw createError(400, 'Email is required');
  if (!password || String(password).length < 6) {
    throw createError(400, 'Password must be at least 6 characters');
  }
  if (usersByEmail.has(normalizedEmail)) {
    throw createError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    id: cryptoId(),
    email: normalizedEmail,
    role,
    passwordHash,
    tokenVersion: 1,
    createdAt: new Date().toISOString(),
  };

  usersByEmail.set(normalizedEmail, user);

  const tokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion,
  };

  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  // Guardar refresh token (para poder revocar/rotar después)
  refreshTokens.set(refreshToken, tokenPayload);

  return {
    user: sanitizeUser(user),
    tokens: { accessToken, refreshToken },
  };
}

async function login({ email, password }) {
  const normalizedEmail = String(email || '')
    .trim()
    .toLowerCase();
  if (!normalizedEmail) throw createError(400, 'Email is required');
  if (!password) throw createError(400, 'Password is required');

  const user = usersByEmail.get(normalizedEmail);
  if (!user) throw createError(401, 'Invalid credentials');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw createError(401, 'Invalid credentials');

  const tokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion,
  };

  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  refreshTokens.set(refreshToken, tokenPayload);

  return {
    user: sanitizeUser(user),
    tokens: { accessToken, refreshToken },
  };
}

function verifyRefreshToken(refreshToken) {
  if (!refreshToken) throw createError(401, 'Refresh token required');

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  if (!refreshTokens.has(refreshToken)) {
    throw createError(401, 'Refresh token revoked or unknown');
  }

  return decoded; // { sub, email, role, tokenVersion, iat, exp }
}

// ✅ Refresh con rotación + ✅ valida tokenVersion contra el user actual
function refresh(refreshToken) {
  if (!refreshToken) throw createError(401, 'Refresh token required');

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw createError(401, 'Invalid refresh token');
  }

  // Debe existir en store (revocable)
  const stored = refreshTokens.get(refreshToken);
  if (!stored) {
    throw createError(401, 'Refresh token revoked or unknown');
  }

  // ✅ VALIDAR tokenVersion usando el user actual
  const user = findUserById(decoded.sub);
  if (!user) {
    refreshTokens.delete(refreshToken);
    throw createError(401, 'User not found');
  }

  if (decoded.tokenVersion !== user.tokenVersion) {
    refreshTokens.delete(refreshToken);
    throw createError(401, 'Token revoked');
  }

  // ROTACIÓN: invalidar el refresh viejo
  refreshTokens.delete(refreshToken);

  // ✅ IMPORTANTE: el nuevo token debe usar el tokenVersion ACTUAL del user
  const tokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion,
  };

  const newAccessToken = signAccessToken(tokenPayload);
  const newRefreshToken = signRefreshToken(tokenPayload);

  refreshTokens.set(newRefreshToken, tokenPayload);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

function logout(refreshToken) {
  if (!refreshToken) {
    throw createError(400, 'Refresh token required');
  }

  if (!refreshTokens.has(refreshToken)) {
    throw createError(401, 'Refresh token already revoked or unknown');
  }

  refreshTokens.delete(refreshToken);

  return { message: 'Logged out successfully' };
}

// ✅ logout global: incrementa tokenVersion + limpia refresh tokens del usuario
function logoutAll(userId) {
  const user = findUserById(userId);
  if (!user) throw createError(404, 'User not found');

  user.tokenVersion = (user.tokenVersion || 1) + 1;

  // eliminar todos los refresh tokens asociados a este user
  for (const [token, data] of refreshTokens.entries()) {
    if (data?.sub === userId) {
      refreshTokens.delete(token);
    }
  }

  return { message: 'Logged out from all sessions' };
}

module.exports = {
  register,
  login,
  verifyRefreshToken,
  refresh,
  logout,
  logoutAll,
  usersByEmail,
  refreshTokens,
};
