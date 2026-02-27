// src/modules/users/users.routes.js
const express = require('express');
const { requireAuth, authorize } = require('../../middlewares/auth');

const router = express.Router();

// Protegido para cualquier usuario autenticado
router.get('/', requireAuth, (req, res) => {
  return res.json({
    message: 'Users route working',
    viewer: req.user,
  });
});

// Ejemplo RBAC: solo admin
router.get('/admin-only', requireAuth, authorize(['admin']), (req, res) => {
  return res.json({ ok: true, message: 'Admin access granted' });
});

module.exports = router;
