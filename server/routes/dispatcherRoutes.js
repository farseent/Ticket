// routes/dispatcherRoutes.js
const express = require('express');
const router = express.Router();
const DispatcherState = require('../models/DispatcherState');
const { protect, restrictTo } = require('../middlewares/auth');

router.use(protect);

// GET /api/dispatcher/state - inspect round-robin pointers (debug/Postman visibility)
router.get('/state', restrictTo('A'), async (req, res, next) => {
  try {
    const state = await DispatcherState.findById('GLOBAL');
    res.json({ state: state || { note: 'Not yet initialized — no leads created' } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;