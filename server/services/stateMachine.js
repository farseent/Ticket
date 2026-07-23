// services/stateMachine.js
const ALLOWED_TRANSITIONS = {
  NEW:                  ['DISPATCHED_B', 'DISPATCHED_C_GROUP'],
  
  // Ticketing Agent
  DISPATCHED_B:         ['SEARCHING_B'],
  SEARCHING_B:          ['CLIENT_CONTACTED_B'],
  CLIENT_CONTACTED_B:   ['CLIENT_CONTACTED_B', 'OPTION_SELECTED_B', 'SEARCHING_B'], // revision loops back, same agent
  OPTION_SELECTED_B:    ['OPTION_SELECTED_B', 'CONFIRMED', 'SEARCHING_B'],
  
  //Ticketing staff and executive
  DISPATCHED_C_GROUP:   ['OPTIONS_GATHERING'],
  OPTIONS_GATHERING:    ['ASSIGNED_D'],
  ASSIGNED_D:           ['CLIENT_CONTACTED_D'],
  CLIENT_CONTACTED_D:   ['CLIENT_CONTACTED_D', 'OPTION_SELECTED_D', 'REVISION_PENDING_A'],
  OPTION_SELECTED_D:    ['OPTION_SELECTED_D', 'CONFIRMED', 'REVISION_PENDING_A'],
  REVISION_PENDING_A:   ['OPTIONS_GATHERING'],    // only A can trigger this

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