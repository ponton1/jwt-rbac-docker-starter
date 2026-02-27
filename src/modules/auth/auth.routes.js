const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const { requireAuth } = require('../../middlewares/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/logout-all', requireAuth, authController.logoutAll);

module.exports = router;
