// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const e = new Error('Not authenticated — missing token');
      e.statusCode = 401;
      throw e;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      const e = new Error('User not found or inactive');
      e.statusCode = 401;
      throw e;
    }
    req.user = user;
    next();
  } catch (err) {
    err.statusCode = err.statusCode || 401;
    next(err);
  }
};

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    const e = new Error(`Role '${req.user.role}' is not permitted to perform this action`);
    e.statusCode = 403;
    return next(e);
  }
  next();
};