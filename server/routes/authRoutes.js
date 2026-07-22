// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { login, register, getMe, logout } = require('../controllers/authController');
const { protect } = require("../middlewares/auth")

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me',protect, getMe);

module.exports = router;