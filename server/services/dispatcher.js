// services/dispatcher.js
const User = require('../models/User');
const DispatcherState = require('../models/DispatcherState');
const Option = require('../models/Option')
const { assertTransition } = require('../services/stateMachine');

async function dispatchStage1(lead, session) {
  // Read current state (create it if this is the very first lead ever)
  let state = await DispatcherState.findOne({ _id: 'GLOBAL' }).session(session);
  if (!state) {
    state = new DispatcherState({
      _id: 'GLOBAL',
      stage1Toggle: 'B_TURN',
      bPointerIndex: 0,
      dPointerIndex: 0,
    });
  }

  const wasBTurn = state.stage1Toggle === 'B_TURN';

  // Flip the toggle for next time
  state.stage1Toggle = wasBTurn ? 'C_TURN' : 'B_TURN';

  if (wasBTurn) {
    const bUsers = await User.find({ role: 'B', isActive: true })
      .sort('_id')
      .session(session);
    if (bUsers.length === 0) throw appError('No active B users available', 503);

    const idx = state.bPointerIndex % bUsers.length;
    const chosenB = bUsers[idx];
    state.bPointerIndex += 1;

    await state.save({ session });

    lead.flowType = 'SINGLE_AGENT';
    lead.assignedB = chosenB._id;
    lead.status = 'DISPATCHED_B';
    return { flowType: 'SINGLE_AGENT', assignedB: chosenB._id };
  } else {
    await state.save({ session });

    lead.flowType = 'MULTI_AGENT';
    lead.status = 'DISPATCHED_C_GROUP';
    return { flowType: 'MULTI_AGENT' };
  }
}

// async function tryCompileAndAssignD(lead, session) {
//   const activeCUsers = await User.find({ role: 'C', isActive: true }).session(session);
//   const submittedOptions = await Option.find({
//     lead: lead._id,
//     round: lead.currentRevisionRound,
//   }).session(session);

//   const submittedByIds = new Set(submittedOptions.map((o) => String(o.submittedBy)));
//   const allCSubmitted = activeCUsers.every((u) => submittedByIds.has(String(u._id)));

//   if (!allCSubmitted) return { compiled: false };

//   assertTransition(lead.status, 'PENDING_D_ASSIGN');
//   lead.status = 'PENDING_D_ASSIGN';

//   let dUser;
//   if (lead.assignedD) {
//     // Sticky routing: revision cycle, same D as before
//     dUser = await User.findById(lead.assignedD).session(session);
//   } else {
//     const dUsers = await User.find({ role: 'D', isActive: true })
//       .sort('_id')
//       .session(session);
//     if (dUsers.length === 0) throw appError('No active D users available', 503);

//     let state = await DispatcherState.findOne({ _id: 'GLOBAL' }).session(session);
//     if (!state) {
//       state = new DispatcherState({ _id: 'GLOBAL', stage1Toggle: 'B_TURN', bPointerIndex: 0, dPointerIndex: 0 });
//     }

//     const idx = state.dPointerIndex % dUsers.length;
//     dUser = dUsers[idx];
//     state.dPointerIndex += 1;
//     await state.save({ session });

//     lead.assignedD = dUser._id;
//   }

//   assertTransition(lead.status, 'ASSIGNED_D');
//   lead.status = 'ASSIGNED_D';

//   return { compiled: true, assignedD: dUser._id };
// }

async function assignD(lead, session) {
  let dUser;
  if (lead.assignedD) {
    dUser = await User.findById(lead.assignedD).session(session); // sticky
  } else {
    const dUsers = await User.find({ role: 'D', isActive: true }).sort('_id').session(session);
    if (dUsers.length === 0) throw appError('No active D users available', 503);

    let state = await DispatcherState.findOne({ _id: 'GLOBAL' }).session(session);
    if (!state) {
      state = new DispatcherState({ _id: 'GLOBAL', stage1Toggle: 'B_TURN', bPointerIndex: 0, dPointerIndex: 0 });
    }
    const idx = state.dPointerIndex % dUsers.length;
    dUser = dUsers[idx];
    state.dPointerIndex += 1;
    await state.save({ session });

    lead.assignedD = dUser._id;
  }
  return dUser;
}

module.exports = { dispatchStage1, assignD };

function appError(msg, code) {
  const e = new Error(msg);
  e.statusCode = code;
  return e;
}

module.exports = { dispatchStage1, assignD };