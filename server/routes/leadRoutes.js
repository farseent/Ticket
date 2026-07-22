// routes/leadRoutes.js
const express = require('express');
const router = express.Router();

const {
  createLead,
  submitOption,
  confirmLead,
  requestRevision,
  getLeads,
  getLeadById,
  getAuditLog,
  contactClient,
} = require('../controllers/leadController');

const { protect, restrictTo } = require('../middlewares/auth');

// All lead routes require authentication
router.use(protect);

// POST /api/leads          - Role A creates a lead (triggers Stage 1 dispatch)
router.post('/', restrictTo('A'), createLead);

// GET /api/leads           - list leads, filtered by role in controller
router.get('/', getLeads);

// GET /api/leads/:id       - single lead detail (with options + assigned users)
router.get('/:id', getLeadById);

// GET /api/leads/:id/audit-log - immutable audit trail for a lead
router.get('/:id/audit-log', getAuditLog);

// PATCH /api/leads/:id/options - B or C submits/adds a flight option
router.patch('/:id/options', restrictTo('B', 'C'), submitOption);

// PATCH /api/leads/:id/confirm - B or D confirms the booking
router.patch('/:id/confirm', restrictTo('B', 'D'), confirmLead);

// PATCH /api/leads/:id/request-revision - D only, bounces back to C group (sticky)
router.patch('/:id/request-revision', restrictTo('D'), requestRevision);

// PATCH /api/leads/:id/contact-client - B or C contact client
router.patch('/:id/contact-client', restrictTo('B', 'D'), contactClient);

module.exports = router;