// controllers/leadController.js
const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const Option = require('../models/Option');
const { assertTransition } = require('../services/stateMachine');
const { dispatchStage1, assignD } = require('../services/dispatcher');
const { logAction } = require('../services/auditLogger');

// POST /api/leads  (Role A)
exports.createLead = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { clientName, clientPhone, clientNotes,
      destination, travelDate, departureAirport, preferredTime,
      passengers} = req.body;
    if (!clientName || !clientPhone || !destination || !travelDate || !departureAirport) {
      const e = new Error('clientName, clientPhone, destination, travelDate, and departureAirport are required');
      e.statusCode = 400;
      throw e;
    }
    if (!passengers?.adults || passengers.adults < 1) {
      const e = new Error('At least one adult passenger is required');
      e.statusCode = 400;
      throw e;
    }

    const lead = new Lead({
      clientName, clientPhone, clientNotes,
      destination, travelDate, departureAirport,
      preferredTime: preferredTime || 'ANY',
      passengers: { adults: passengers.adults, children: passengers.children || 0 },
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
      if (String(lead.assignedB) !== String(req.user._id)) {
        const e = new Error('This lead is not assigned to you');
        e.statusCode = 403;
        throw e;
      }

      if (lead.status === 'DISPATCHED_B') {
        assertTransition(lead.status, 'SEARCHING_B');
        lead.status = 'SEARCHING_B';
      } else if (['CLIENT_CONTACTED_B', 'OPTION_SELECTED_B'].includes(lead.status)) {
        // Client wants a fresh search — drop any tentative selection, it's stale now
        assertTransition(lead.status, 'SEARCHING_B');
        lead.status = 'SEARCHING_B';
        lead.selectedOption = null;
      }
      await lead.save({ session });

      await Option.create([{
        lead: lead._id, submittedBy: req.user._id, round: 0,
        airline, route, departTime, arriveTime, price, layovers, notes,
      }], { session });

      await logAction({
        leadId: lead._id, actorRole: 'B', actorId: req.user._id,
        actionType: 'OPTION_ADDED', payload: { airline, route, price, departTime, arriveTime },
      });

      await session.commitTransaction();
      return res.json({ lead });
    }

    if (req.user.role === 'C') {
      const OPEN_STATUSES = ['DISPATCHED_C_GROUP', 'OPTIONS_GATHERING', 'ASSIGNED_D', 'CLIENT_CONTACTED_D', 'OPTION_SELECTED_D'];
      if (!OPEN_STATUSES.includes(lead.status)) {
        const e = new Error(`This lead is not currently open for new options (status: ${lead.status})`);
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
        actionType: 'OPTION_ADDED', payload: { airline, route, price, departTime, arriveTime },
      });

      let dNotifiedNow = false;

      // Only the FIRST submission of this round triggers D assignment
      if (lead.status === 'OPTIONS_GATHERING') {
        const dUser = await assignD(lead, session);
        dNotifiedNow = true;

        assertTransition(lead.status, 'ASSIGNED_D');
        lead.status = 'ASSIGNED_D';

        await logAction({
          leadId: lead._id, actorRole: 'C', actorId: req.user._id,
          actionType: 'D_ASSIGNED', payload: { assignedD: dUser._id, assignedDName: dUser.name  },
        });
      }

  await lead.save({ session });
  await session.commitTransaction();
  return res.json({ lead, dNotified: dNotifiedNow });
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
    const lead = await Lead.findById(req.params.id).populate({
      path: 'selectedOption',
      populate: { path: 'submittedBy', select: 'name role' }
    });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

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

    if (!lead.selectedOption) {
      const e = new Error('No option has been selected for this lead yet');
      e.statusCode = 409;
      throw e;
    }

    assertTransition(lead.status, 'CONFIRMED'); // only reachable from OPTION_SELECTED_B/D
    lead.status = 'CONFIRMED';
    await lead.save();

    await logAction({
      leadId: lead._id, actorRole: req.user.role, actorId: req.user._id,
      actionType: 'TICKET_CONFIRMED',
      payload: {
        confirmedBy: req.user._id,
        airline: lead.selectedOption.airline,
        route: lead.selectedOption.route,
        price: lead.selectedOption.price,
        optionSubmittedByName: lead.selectedOption.submittedBy?.name || null,
        optionSubmittedByRole: lead.selectedOption.submittedBy?.role || null,
      },
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
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      const e = new Error('reason is required — describe what the client wants changed');
      e.statusCode = 400;
      throw e;
    }

    assertTransition(lead.status, 'REVISION_PENDING_A');
    lead.status = 'REVISION_PENDING_A';
    lead.pendingRevisionReason = reason;
    lead.selectedOption = null;
    await lead.save();

    await logAction({
      leadId: lead._id, actorRole: 'D', actorId: req.user._id,
      actionType: 'REVISION_REQUESTED', payload: { reason },
    });

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
      if (req.query.all === 'true') {
        filter = { flowType: 'MULTI_AGENT' }; // full history, but still only C's own flow
      } else {
        filter = {
          flowType: 'MULTI_AGENT',
          status: { $in: ['DISPATCHED_C_GROUP', 'OPTIONS_GATHERING', 'ASSIGNED_D', 'CLIENT_CONTACTED_D', 'OPTION_SELECTED_D'] },
        };
      }
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
      .populate('createdBy', 'name email')
      .populate('selectedOption');

    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    // Role-based visibility guard (not just UI-level filtering)
    const { role, _id } = req.user;
    if (role === 'B' && String(lead.assignedB?._id || lead.assignedB) !== String(_id)) {
      const e = new Error('You do not have access to this lead');
      e.statusCode = 403;
      throw e;
    }
    if (role === 'D' && lead.assignedD && String(lead.assignedD._id) !== String(_id)) {
      const e = new Error('You do not have access to this lead');
      e.statusCode = 403;
      throw e;
    }
    
    // Role C can view any lead that ever belonged to the multi-agent flow —
    // matches the same scoping used in getLeads' "all" mode.
    if (role === 'C' && lead.flowType !== 'MULTI_AGENT') {
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

// PATCH /api/leads/:id/select-option  (Role B or D)
exports.selectOption = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const { optionId } = req.body;
    if (!optionId) {
      const e = new Error('optionId is required');
      e.statusCode = 400;
      throw e;
    }

    // Ownership + valid pre-state, per role
    let targetStatus;
    if (req.user.role === 'B') {
      if (String(lead.assignedB) !== String(req.user._id)) {
        const e = new Error('This lead is not assigned to you');
        e.statusCode = 403;
        throw e;
      }
      if (!['CLIENT_CONTACTED_B', 'OPTION_SELECTED_B'].includes(lead.status)) {
        const e = new Error(`Cannot select an option from status: ${lead.status}. Contact the client first.`);
        e.statusCode = 409;
        throw e;
      }
      targetStatus = 'OPTION_SELECTED_B';
    } else if (req.user.role === 'D') {
      if (String(lead.assignedD) !== String(req.user._id)) {
        const e = new Error('This lead is not assigned to you');
        e.statusCode = 403;
        throw e;
      }
      if (!['CLIENT_CONTACTED_D', 'OPTION_SELECTED_D'].includes(lead.status)) {
        const e = new Error(`Cannot select an option from status: ${lead.status}. Contact the client first.`);
        e.statusCode = 409;
        throw e;
      }
      targetStatus = 'OPTION_SELECTED_D';
    } else {
      const e = new Error('Only Role B or D may select an option');
      e.statusCode = 403;
      throw e;
    }

    // The option must genuinely belong to this lead — never trust a client-supplied ID blindly
    const option = await Option.findOne({ _id: optionId, lead: lead._id });
    if (!option) {
      const e = new Error('This option was not submitted for this lead');
      e.statusCode = 400;
      throw e;
    }

    const isChange = lead.selectedOption && String(lead.selectedOption) !== String(optionId);
    const isFirstSelection = !lead.selectedOption;

    assertTransition(lead.status, targetStatus);
    lead.status = targetStatus;
    lead.selectedOption = option._id;
    await lead.save();

    await logAction({
      leadId: lead._id, actorRole: req.user.role, actorId: req.user._id,
      actionType: isChange ? 'OPTION_SELECTION_CHANGED' : 'OPTION_SELECTED',
      payload: {
        airline: option.airline, route: option.route, price: option.price,
        wasFirstSelection: isFirstSelection,
      },
    });

    res.json({ lead });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/leads/:id/resend-to-c  (Role A only)
exports.resendToCGroup = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    assertTransition(lead.status, 'OPTIONS_GATHERING'); // only legal from REVISION_PENDING_A

    const reason = lead.pendingRevisionReason;
    const { destination, travelDate, departureAirport, preferredTime, passengers } = req.body;
    const fieldChanges = [];
    
    const applyChange = (field, newValue, currentValue) => {
      if (newValue === undefined || newValue === null || newValue === '') return currentValue;
      const oldComparable = currentValue instanceof Date ? currentValue.toISOString().slice(0, 10) : currentValue;
      if (String(oldComparable) !== String(newValue)) {
        fieldChanges.push({ field, oldValue: oldComparable, newValue });
        return newValue;
      }
      return currentValue;
    };

    lead.destination = applyChange('destination', destination, lead.destination);
    lead.travelDate = applyChange('travelDate', travelDate, lead.travelDate);
    lead.departureAirport = applyChange('departureAirport', departureAirport, lead.departureAirport);
    lead.preferredTime = applyChange('preferredTime', preferredTime, lead.preferredTime);
    
    if (passengers) {
      lead.passengers.adults = applyChange('passengers.adults', Number(passengers.adults), lead.passengers.adults);
      if (passengers.children !== undefined) {
        lead.passengers.children = applyChange('passengers.children', Number(passengers.children), lead.passengers.children);
      }
    }    
    
    lead.currentRevisionRound += 1;

    lead.revisionHistory.push({
      round: lead.currentRevisionRound,
      reason,
      requestedAt: new Date(),
    });

    lead.pendingRevisionReason = null;
    lead.status = 'OPTIONS_GATHERING';
    await lead.save();

    await logAction({
      leadId: lead._id, actorRole: 'A', actorId: req.user._id,
      actionType: 'LEAD_RESENT_TO_C_GROUP',
      payload: { reason, newRound: lead.currentRevisionRound, fieldChanges  },
    });

    res.json({ lead });
  } catch (err) {
    next(err);
  }
};