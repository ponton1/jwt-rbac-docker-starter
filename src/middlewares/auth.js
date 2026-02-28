// src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const usersRepo = require('../modules/users/users.repository');

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
      throw createError(401, 'Missing or invalid Authorization header');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch {
      throw createError(401, 'Invalid access token');
    }

    // decoded: { sub, email, role, tokenVersion, iat, exp }
    const user = await usersRepo.findById(decoded.sub);
    if (!user) {
      throw createError(401, 'User not found');
    }

    // TokenVersion check (logout-all / revocación global)
    if (decoded.tokenVersion !== user.token_version) {
      throw createError(401, 'Token revoked');
    }

    req.user = decoded;
    return next();
  } catch (err) {
    return next(err);
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) throw createError(401, 'Unauthorized');
      if (!allowedRoles.includes(req.user.role)) {
        throw createError(403, 'Forbidden');
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = {
  requireAuth,
  requireRole,
};
