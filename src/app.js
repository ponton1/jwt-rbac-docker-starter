const express = require('express');

const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const db = require('./config/db');

const app = express();
app.use(express.json());

// health
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// db health (ANTES del error handler)
app.get('/db-health', async (req, res, next) => {
  try {
    const result = await db.query('SELECT NOW() as now');
    return res.json({ ok: true, dbTime: result.rows[0].now });
  } catch (err) {
    return next(err);
  }
});

// routes
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);

// error handler (SIEMPRE al final)
app.use(errorHandler);

module.exports = app;
