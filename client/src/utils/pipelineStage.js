// Buckets the many backend statuses into 4 visual stages so the table
// can show progress at a glance instead of just raw enum text.
const STAGE_LABELS = ['Intake', 'Sourcing', 'Client Contact', 'Confirmed'];

const STAGE_MAP = {
  NEW: 0, DISPATCHED_B: 0, DISPATCHED_C_GROUP: 0,
  SEARCHING_B: 1, OPTIONS_GATHERING: 1, PENDING_D_ASSIGN: 1, ASSIGNED_D: 1,
  CLIENT_CONTACTED_B: 2, CLIENT_CONTACTED_D: 2, REVISION_REQUESTED: 2,
  CONFIRMED: 3,
};

export function getStageIndex(status) {
  return STAGE_MAP[status] ?? 0;
}

export { STAGE_LABELS };