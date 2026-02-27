// src/middlewares/errorHandler.js
function errorHandler(err, req, res, _next) {
  const status = err.status || 500;

  res.status(status).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
    },
  });
}

module.exports = errorHandler;
