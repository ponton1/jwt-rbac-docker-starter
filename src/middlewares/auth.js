// src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const { usersByEmail } = require('../modules/auth/auth.service');

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
      const err = new Error('Missing or invalid Authorization header');
      err.status = 401;
      throw err;
    }

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    // payload: { sub, email, role, tokenVersion, iat, exp }

    const normalizedEmail = String(payload.email || '')
      .trim()
      .toLowerCase();
    const user = usersByEmail.get(normalizedEmail);

    if (!user) {
      const err = new Error('User not found');
      err.status = 401;
      throw err;
    }

    if (typeof payload.tokenVersion !== 'number') {
      const err = new Error('Token missing tokenVersion');
      err.status = 401;
      throw err;
    }

    if (payload.tokenVersion !== user.tokenVersion) {
      const err = new Error('Token revoked');
      err.status = 401;
      throw err;
    }

    // ✅ aquí el ajuste
    req.user = {
      sub: payload.sub, // <- clave
      email: payload.email,
      role: payload.role,
      tokenVersion: payload.tokenVersion,
    };

    return next();
  } catch (err) {
    err.status = err.status || 401;
    return next(err);
  }
}

function authorize(allowedRoles = []) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        const err = new Error('Unauthenticated');
        err.status = 401;
        throw err;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        const err = new Error('Forbidden');
        err.status = 403;
        throw err;
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = { requireAuth, authorize };
