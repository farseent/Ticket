// Turns each AuditLog's payload into a short, readable line specific to
// that action type. Returns null when there's nothing meaningful to show.
const OUTCOME_LABELS = {
  REACHED: 'Reached',
  NO_ANSWER: 'No Answer',
  VOICEMAIL: 'Voicemail',
  CALLBACK_REQUESTED: 'Callback Requested',
};

export function getActionDetail(log) {
  const p = log.payload || {};

  switch (log.actionType) {
    case 'LEAD_DISPATCHED_B':
      return 'Assigned to a Ticketing Agent';
    case 'LEAD_DISPATCHED_C_GROUP':
      return 'Broadcast to all Ticketing Staff';
    case 'OPTION_ADDED':
      return p.airline ? `${p.airline} — ${p.route} — $${p.price}` : null;
    case 'D_ASSIGNED':
      return 'Compiled options routed to a Ticketing Executive';
    case 'OPTION_SELECTED':
    case 'OPTION_SELECTION_CHANGED':
      return p.airline ? `Client agreed to: ${p.airline} — ${p.route} — $${p.price}` : null;
    case 'CLIENT_CONTACT_ATTEMPTED':
      return [
        p.outcome ? `Outcome: ${OUTCOME_LABELS[p.outcome] || p.outcome}` : null,
        p.notes || null,
      ].filter(Boolean).join(' · ');
    case 'TICKET_CONFIRMED':
      return p.airline ? `Booked: ${p.airline} — ${p.route} — $${p.price}` : null;
    case 'REVISION_REQUESTED':
      return p.reason ? `Client requested: "${p.reason}"` : null;
    case 'LEAD_RESENT_TO_C_GROUP':
      return p.reason ? `Round ${p.newRound} — "${p.reason}"` : null;
    default:
      return null;
  }
}