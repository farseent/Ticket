const STAGE_LABELS = ['Intake', 'Sourcing', 'Client Contact', 'Confirmed'];

const STAGE_MAP = {
  NEW: 0, DISPATCHED_B: 0, DISPATCHED_C_GROUP: 0,
  SEARCHING_B: 1, OPTIONS_GATHERING: 1, ASSIGNED_D: 1,
  CLIENT_CONTACTED_B: 2, CLIENT_CONTACTED_D: 2,
  OPTION_SELECTED_B: 2, OPTION_SELECTED_D: 2,
  REVISION_PENDING_A: 2,
  CONFIRMED: 3,
};

export function getStageIndex(status) {
  return STAGE_MAP[status] ?? 0;
}

export { STAGE_LABELS };