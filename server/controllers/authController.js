// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
  } catch (err) {
    next(err);
  }
};