export const STATUS_COLORS = {
  NEW: 'bg-slate-100 text-slate-600',
  DISPATCHED_B: 'bg-blue-50 text-blue-700',
  SEARCHING_B: 'bg-blue-50 text-blue-700',
  CLIENT_CONTACTED_B: 'bg-indigo-50 text-indigo-700',
  DISPATCHED_C_GROUP: 'bg-violet-50 text-violet-700',
  OPTIONS_GATHERING: 'bg-violet-50 text-violet-700',
  PENDING_D_ASSIGN: 'bg-amber-50 text-amber-700',
  ASSIGNED_D: 'bg-amber-50 text-amber-700',
  CLIENT_CONTACTED_D: 'bg-indigo-50 text-indigo-700',
  REVISION_REQUESTED: 'bg-rose-50 text-rose-700',
  CONFIRMED: 'bg-emerald-50 text-emerald-700',
};

export function getStatusColor(status) {
  return STATUS_COLORS[status] || 'bg-slate-100 text-slate-600';
}