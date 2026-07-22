// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();

const {
  getBDashboard,
  getCDashboard,
  getDDashboard,
} = require('../controllers/dashboardController');

const { protect, restrictTo } = require('../middlewares/auth');

router.use(protect);

// GET /api/dashboard/b/:userId - leads assigned to this B user
router.get('/b/:userId', restrictTo('A', 'B'), getBDashboard);

// GET /api/dashboard/c          - all leads currently broadcast to C group
router.get('/c', restrictTo('A', 'C'), getCDashboard);

// GET /api/dashboard/d/:userId - leads assigned/sticky-pinned to this D user
router.get('/d/:userId', restrictTo('A', 'D'), getDDashboard);

module.exports = router;