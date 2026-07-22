// services/stateMachine.js
const ALLOWED_TRANSITIONS = {
  NEW:                  ['DISPATCHED_B', 'DISPATCHED_C_GROUP'],
  DISPATCHED_B:         ['SEARCHING_B'],
  SEARCHING_B:          ['CLIENT_CONTACTED_B'],
  CLIENT_CONTACTED_B:   ['CLIENT_CONTACTED_B', 'CONFIRMED', 'SEARCHING_B'], // revision loops back, same agent
  DISPATCHED_C_GROUP:   ['OPTIONS_GATHERING'],
  OPTIONS_GATHERING:    ['PENDING_D_ASSIGN'],
  PENDING_D_ASSIGN:     ['ASSIGNED_D'],
  ASSIGNED_D:           ['CLIENT_CONTACTED_D'],
  CLIENT_CONTACTED_D:   ['CLIENT_CONTACTED_D', 'CONFIRMED', 'REVISION_REQUESTED'],
  REVISION_REQUESTED:   ['OPTIONS_GATHERING'], // back to C group, D stays pinned
  CONFIRMED:            [], // terminal
};

function assertTransition(currentStatus, nextStatus) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    const err = new Error(
      `Illegal transition: ${currentStatus} -> ${nextStatus}`
    );
    err.statusCode = 409;
    throw err;
  }
}

module.exports = { ALLOWED_TRANSITIONS, assertTransition };