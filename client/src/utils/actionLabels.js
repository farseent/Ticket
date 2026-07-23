export const ACTION_LABELS = {
  LEAD_CREATED: 'Lead Created',
  LEAD_DISPATCHED_B: 'Dispatched to Ticketing Agent',
  LEAD_DISPATCHED_C_GROUP: 'Broadcast to Ticketing Staff',
  OPTION_ADDED: 'Flight Option Submitted',
  D_ASSIGNED: 'Assigned to Ticketing Executive',
  OPTION_SELECTED: 'Option Selected by Client',
  OPTION_SELECTION_CHANGED: 'Client Changed Selection',
  CLIENT_CONTACT_ATTEMPTED: 'Client Contact Attempt Logged',
  TICKET_CONFIRMED: 'Ticket Confirmed',
  REVISION_REQUESTED: 'Revision Requested',
  LEAD_RESENT_TO_C_GROUP: 'Resent to Ticketing Staff',
};

export function getActionLabel(actionType) {
  return ACTION_LABELS[actionType] || actionType;
}