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

    // ✅ FALTABA await
    const tokens = await authService.refresh(refreshToken);

    return res.json({
      success: true,
      data: { tokens },
    });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;

    // ✅ FALTABA await
    const result = await authService.logout(refreshToken);

    return res.json({
      success: true,
      data: result, // { message: 'Logged out successfully' }
    });
  } catch (err) {
    return next(err);
  }
}

// ✅ logout-all usando req.user

async function logoutAll(req, res, next) {
  try {
    // ✅ FALTABA await
    const result = await authService.logoutAll(req.user.sub);

    return res.json({
      success: true,
      data: result, // { message: 'Logged out from all sessions' }
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
};
