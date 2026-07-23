// controllers/dashboardController.js
const Lead = require('../models/Lead');
const Option = require('../models/Option');

// GET /api/dashboard/b/:userId - leads assigned to this B user
exports.getBDashboard = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // B can only view their own dashboard; A can view any
    if (req.user.role === 'B' && String(req.user._id) !== userId) {
      const e = new Error('You can only view your own dashboard');
      e.statusCode = 403;
      throw e;
    }

    const leads = await Lead.find({ assignedB: userId })
      .populate('assignedB', 'name email')
      .sort('-createdAt');

    const summary = {
      total: leads.length,
      active: leads.filter((l) => l.status !== 'CONFIRMED').length,
      confirmed: leads.filter((l) => l.status === 'CONFIRMED').length,
    };

    res.json({ userId, summary, leads });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/c - all leads currently broadcast to C group
exports.getCDashboard = async (req, res, next) => {
  try {
    const leads = await Lead.find({
      status: { $in: ['DISPATCHED_C_GROUP', 'OPTIONS_GATHERING', 'ASSIGNED_D', 'CLIENT_CONTACTED_D', 'OPTION_SELECTED_D'] },
    }).sort('-createdAt');

    // For each lead, show which C users (if any) have already submitted
    // for the CURRENT round, so a C agent knows what's still pending.
    const leadIds = leads.map((l) => l._id);
    const options = await Option.find({ lead: { $in: leadIds } })
      .populate('submittedBy', 'name email');

    const optionsByLead = options.reduce((acc, opt) => {
      const key = String(opt.lead);
      acc[key] = acc[key] || [];
      acc[key].push(opt);
      return acc;
    }, {});

    const enriched = leads.map((lead) => {
      const leadOptions = (optionsByLead[String(lead._id)] || []).filter(
        (o) => o.round === lead.currentRevisionRound
      );
      const submittedByMe = leadOptions.some(
        (o) => String(o.submittedBy._id) === String(req.user._id)
      );
      return {
        lead,
        currentRoundSubmissions: leadOptions.length,
        submittedByMe,
      };
    });

    res.json({ count: enriched.length, leads: enriched });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/d/:userId - leads assigned/sticky-pinned to this D user
exports.getDDashboard = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (req.user.role === 'D' && String(req.user._id) !== userId) {
      const e = new Error('You can only view your own dashboard');
      e.statusCode = 403;
      throw e;
    }

    const leads = await Lead.find({ assignedD: userId })
      .populate('assignedD', 'name email')
      .sort('-createdAt');

    const summary = {
      total: leads.length,
      pendingContact: leads.filter((l) => l.status === 'ASSIGNED_D').length,
      awaitingRevisionOptions: leads.filter((l) => l.status === 'OPTIONS_GATHERING' && l.assignedD).length,
      confirmed: leads.filter((l) => l.status === 'CONFIRMED').length,
    };

    res.json({ userId, summary, leads });
  } catch (err) {
    next(err);
  }
};