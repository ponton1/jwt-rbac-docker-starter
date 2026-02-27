// src/modules/auth/auth.controller.js
const authService = require('./auth.service');

async function register(req, res, next) {
  try {
    const { email, password, role } = req.body;
    const result = await authService.register({ email, password, role });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const tokens = authService.refresh(refreshToken);

    res.json({
      success: true,
      data: { tokens },
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    authService.logout(refreshToken);

    res.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (err) {
    next(err);
  }
}

// ✅ NUEVO: logout-all usando req.user
async function logoutAll(req, res, next) {
  try {
    // req.user lo setea requireAuth
    authService.logoutAll(req.user.sub);

    res.json({
      success: true,
      data: { message: 'Logged out from all sessions' },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
};
