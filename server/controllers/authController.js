// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' }); 

const cookieOptions = {
  httpOnly: true, // JS on the page can never read this — the core XSS mitigation
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches JWT expiry
};

const toPublicUser = (user) => ({
  id: user._id, name: user.name, email: user.email, role: user.role,
});

exports.register = async (req, res, next) => {
  try {    
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      const e = new Error('name, email, password, and role are required');
      e.statusCode = 400;
      throw e;
    }
    if (!['A', 'B', 'C', 'D'].includes(role)) {
      const e = new Error('role must be one of A, B, C, D');
      e.statusCode = 400;
      throw e;
    }
    const existing = await User.findOne({ email });
    if (existing) {
      const e = new Error('An account with this email already exists');
      e.statusCode = 409;
      throw e;
    }

    const user = await User.create({ name, email, password, role, isActive: true });

    const token = generateToken(user._id);
    res.cookie('token', token, cookieOptions);
    res.status(201).json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!email || !password) {
      const e = new Error('Please provide email and password');
      e.statusCode = 400;
      throw e;
    }
    
    if (!user) {
      const e = new Error('Invalid credentials');
      e.statusCode = 401;
      throw e;
    }

    const match = await user.comparePassword(password);
    if (!match) {
      const e = new Error('Invalid credentials');
      e.statusCode = 401;
      throw e;
    }
    const token = generateToken(user._id)
    res.cookie("token", token, cookieOptions)
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.clearCookie('token', {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
    });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me — lets the frontend restore session state on page load/refresh
exports.getMe = async (req, res, next) => {
  try {
    res.json({ user: toPublicUser(req.user) });
  } catch (err) {
    next(err);
  }
};