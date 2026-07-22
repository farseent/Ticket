// controllers/leadController.js
const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const Option = require('../models/Option');
const { assertTransition } = require('../services/stateMachine');
const { dispatchStage1, tryCompileAndAssignD } = require('../services/dispatcher');
const { logAction } = require('../services/auditLogger');

// POST /api/leads  (Role A)
exports.createLead = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { clientName, clientPhone, clientNotes } = req.body;
    if (!clientName || !clientPhone) {
      const e = new Error('clientName and clientPhone are required');
      e.statusCode = 400;
      throw e;
    }

    const lead = new Lead({
      clientName, clientPhone, clientNotes,
      status: 'NEW',
      createdBy: req.user._id,
      currentRevisionRound: 1,
    });

    const dispatchResult = await dispatchStage1(lead, session);
    await lead.save({ session });

    await logAction({
      leadId: lead._id,
      actorRole: 'A',
      actorId: req.user._id,
      actionType: dispatchResult.flowType === 'SINGLE_AGENT'
        ? 'LEAD_DISPATCHED_B'
        : 'LEAD_DISPATCHED_C_GROUP',
      payload: dispatchResult,
    });

    await session.commitTransaction();
    res.status(201).json({ lead });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// PATCH /api/leads/:id/options  (Role B or C submit/add an option)
exports.submitOption = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const lead = await Lead.findById(req.params.id).session(session);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const { airline, route, departTime, arriveTime, price, layovers, notes } = req.body;

    if (req.user.role === 'B') {

      // Ownership guard: only the assigned B agent may act on this lead
      if (String(lead.assignedB) !== String(req.user._id)) {
        const e = new Error('This lead is not assigned to you');
        e.statusCode = 403;
        throw e;
      }

      // Single-agent path: B searches directly, no state transition needed on first search
      if (lead.status === 'DISPATCHED_B') {
        assertTransition(lead.status, 'SEARCHING_B');
        lead.status = 'SEARCHING_B';
        await lead.save({ session });
      }
      await Option.create([{
        lead: lead._id, submittedBy: req.user._id, round: 0,
        airline, route, departTime, arriveTime, price, layovers, notes,
      }], { session });

      await logAction({
        leadId: lead._id, actorRole: 'B', actorId: req.user._id,
        actionType: 'OPTION_ADDED', payload: { airline, route, price },
      });

      await session.commitTransaction();
      return res.json({ lead });
    }

    if (req.user.role === 'C') {
      if (lead.status !== 'DISPATCHED_C_GROUP' && lead.status !== 'OPTIONS_GATHERING') {
        const e = new Error(`Lead not open for C submissions (status: ${lead.status})`);
        e.statusCode = 409;
        throw e;
      }
      if (lead.status === 'DISPATCHED_C_GROUP') {
        assertTransition(lead.status, 'OPTIONS_GATHERING');
        lead.status = 'OPTIONS_GATHERING';
      }

      await Option.create([{
        lead: lead._id, submittedBy: req.user._id, round: lead.currentRevisionRound,
        airline, route, departTime, arriveTime, price, layovers, notes,
      }], { session });

      await logAction({
        leadId: lead._id, actorRole: 'C', actorId: req.user._id,
        actionType: 'OPTION_ADDED', payload: { airline, route, price },
      });

      // Check if this was the LAST C user needed -> auto compile + assign D
      const result = await tryCompileAndAssignD(lead, session);
      if (result.compiled) {
        await logAction({
          leadId: lead._id, actorRole: 'C', actorId: req.user._id,
          actionType: 'OPTIONS_COMPILED', payload: {},
        });
        await logAction({
          leadId: lead._id, actorRole: 'C', actorId: req.user._id,
          actionType: 'D_ASSIGNED', payload: { assignedD: result.assignedD },
        });
      }

      await lead.save({ session });
      await session.commitTransaction();
      return res.json({ lead, allOptionsCompiled: result.compiled });
    }

    const e = new Error('Only Role B or C may submit options');
    e.statusCode = 403;
    throw e;
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// PATCH /api/leads/:id/confirm  (Role B or D)
exports.confirmLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    // Ownership guard: only the specifically assigned agent may confirm
    if (req.user.role === 'B' && String(lead.assignedB) !== String(req.user._id)) {
      const e = new Error('This lead is not assigned to you');
      e.statusCode = 403;
      throw e;
    }
    if (req.user.role === 'D' && String(lead.assignedD) !== String(req.user._id)) {
      const e = new Error('This lead is not assigned to you');
      e.statusCode = 403;
      throw e;
    }

    assertTransition(lead.status, 'CONFIRMED');
    lead.status = 'CONFIRMED';
    await lead.save();

    await logAction({
      leadId: lead._id, actorRole: req.user.role, actorId: req.user._id,
      actionType: 'TICKET_CONFIRMED', payload: { confirmedBy: req.user._id },
    });

    res.json({ lead });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/leads/:id/request-revision  (Role D only)
exports.requestRevision = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    if (req.user.role !== 'D') {
      const e = new Error('Only Role D may request a revision');
      e.statusCode = 403;
      throw e;
    }
    if (String(lead.assignedD) !== String(req.user._id)) {
      const e = new Error('This lead is not assigned to you');
      e.statusCode = 403;
      throw e;
    }
    
    assertTransition(lead.status, 'REVISION_REQUESTED');
    lead.status = 'REVISION_REQUESTED';
    lead.currentRevisionRound += 1; // new round -> C must resubmit fresh options
    await lead.save();

    assertTransition(lead.status, 'OPTIONS_GATHERING');
    lead.status = 'OPTIONS_GATHERING'; // re-open for C group; assignedD stays pinned

    await logAction({
      leadId: lead._id, actorRole: 'D', actorId: req.user._id,
      actionType: 'REVISION_REQUESTED',
      payload: { reason: req.body.reason, newRound: lead.currentRevisionRound },
    });

    await lead.save();
    res.json({ lead });
  } catch (err) {
    next(err);
  }
};

// GET /api/leads - list leads, filtered by role
exports.getLeads = async (req, res, next) => {
  try {
    const { role, _id } = req.user;
    let filter = {};

    if (role === 'A') {
      if (req.query.status) filter.status = req.query.status;
      if (req.query.flowType) filter.flowType = req.query.flowType;
    } else if (role === 'B') {
      filter = { assignedB: _id };
    } else if (role === 'C') {
      filter = { status: { $in: ['DISPATCHED_C_GROUP', 'OPTIONS_GATHERING'] } };
    } else if (role === 'D') {
      filter = { assignedD: _id };
    }

    const leads = await Lead.find(filter)
      .populate('assignedB', 'name email')
      .populate('assignedD', 'name email')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    // For Role C, enrich each lead with submission status for the current round
    if (role === 'C') {
      const leadIds = leads.map((l) => l._id);
      const options = await Option.find({ lead: { $in: leadIds } });

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
          (o) => String(o.submittedBy) === String(_id)
        );
        return {
          lead,
          currentRoundSubmissions: leadOptions.length,
          submittedByMe,
        };
      });

      return res.json({ count: enriched.length, leads: enriched });
    }

    res.json({ count: leads.length, leads });
  } catch (err) {
    next(err);
  }
};

// GET /api/leads/:id - single lead detail with options + assigned users
exports.getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedB', 'name email')
      .populate('assignedD', 'name email')
      .populate('createdBy', 'name email');

    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    // Role-based visibility guard (not just UI-level filtering)
    const { role, _id } = req.user;
    if (role === 'B' && String(lead.assignedB) !== String(_id)) {
      const e = new Error('You do not have access to this lead');
      e.statusCode = 403;
      throw e;
    }
    if (role === 'D' && lead.assignedD && String(lead.assignedD._id) !== String(_id)) {
      const e = new Error('You do not have access to this lead');
      e.statusCode = 403;
      throw e;
    }
    // Role C can view any lead currently in a group-broadcast state
    if (role === 'C' && !['DISPATCHED_C_GROUP', 'OPTIONS_GATHERING'].includes(lead.status)) {
      const e = new Error('This lead is not open to Role C');
      e.statusCode = 403;
      throw e;
    }

    const options = await Option.find({ lead: lead._id })
      .populate('submittedBy', 'name email role')
      .sort('round createdAt');

    res.json({ lead, options });
  } catch (err) {
    next(err);
  }
};

// GET /api/leads/:id/audit-log - immutable trail
exports.getAuditLog = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const AuditLog = require('../models/AuditLog');
    const logs = await AuditLog.find({ lead: lead._id })
      .populate('actorId', 'name email role')
      .sort('timestamp');

    res.json({ leadId: lead._id, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/leads/:id/contact-client  (Role B or D)
exports.contactClient = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const { outcome, notes } = req.body; // outcome: 'REACHED' | 'NO_ANSWER' | 'VOICEMAIL' | 'CALLBACK_REQUESTED'
    if (!outcome) {
      const e = new Error('outcome is required (e.g. REACHED, NO_ANSWER, VOICEMAIL)');
      e.statusCode = 400;
      throw e;
    }

    if (req.user.role === 'B') {
      if (String(lead.assignedB) !== String(req.user._id)) {
        const e = new Error('This lead is not assigned to you');
        e.statusCode = 403;
        throw e;
      }
      if (!['SEARCHING_B', 'CLIENT_CONTACTED_B'].includes(lead.status)) {
        const e = new Error(`Cannot log contact from status: ${lead.status}`);
        e.statusCode = 409;
        throw e;
      }
      assertTransition(lead.status, 'CLIENT_CONTACTED_B');
      lead.status = 'CLIENT_CONTACTED_B';
    } else if (req.user.role === 'D') {
      if (String(lead.assignedD) !== String(req.user._id)) {
        const e = new Error('This lead is not assigned to you');
        e.statusCode = 403;
        throw e;
      }
      if (!['ASSIGNED_D', 'CLIENT_CONTACTED_D'].includes(lead.status)) {
        const e = new Error(`Cannot log contact from status: ${lead.status}`);
        e.statusCode = 409;
        throw e;
      }
      assertTransition(lead.status, 'CLIENT_CONTACTED_D');
      lead.status = 'CLIENT_CONTACTED_D';
    } else {
      const e = new Error('Only Role B or D may log a client contact attempt');
      e.statusCode = 403;
      throw e;
    }

    await lead.save();

    await logAction({
      leadId: lead._id, actorRole: req.user.role, actorId: req.user._id,
      actionType: 'CLIENT_CONTACT_ATTEMPTED',
      payload: { outcome, notes: notes || null },
    });

    res.json({ lead });
  } catch (err) {
    next(err);
  }
};