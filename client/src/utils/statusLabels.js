export const STATUS_COLORS = {
  NEW: 'bg-slate-100 text-slate-600',
  DISPATCHED_B: 'bg-blue-50 text-blue-700',
  SEARCHING_B: 'bg-blue-50 text-blue-700',
  CLIENT_CONTACTED_B: 'bg-indigo-50 text-indigo-700',
  OPTION_SELECTED_B: 'bg-teal-50 text-teal-700',
  DISPATCHED_C_GROUP: 'bg-violet-50 text-violet-700',
  OPTIONS_GATHERING: 'bg-violet-50 text-violet-700',
  ASSIGNED_D: 'bg-amber-50 text-amber-700',
  CLIENT_CONTACTED_D: 'bg-indigo-50 text-indigo-700',
  OPTION_SELECTED_D: 'bg-teal-50 text-teal-700',
  REVISION_PENDING_A: 'bg-orange-50 text-orange-700',
  CONFIRMED: 'bg-emerald-50 text-emerald-700',
};

export const STATUS_DISPLAY_LABELS = {
  NEW: 'New Lead',
  DISPATCHED_B: 'Assigned to Ticketing Agent',
  SEARCHING_B: 'Searching for Flights',
  CLIENT_CONTACTED_B: 'Client Contacted',
  OPTION_SELECTED_B: 'Option Selected — Awaiting Booking',
  DISPATCHED_C_GROUP: 'Broadcast to Ticketing Staff',
  OPTIONS_GATHERING: 'Gathering Options',
  ASSIGNED_D: 'With Ticketing Executive',
  CLIENT_CONTACTED_D: 'Client Contacted',
  OPTION_SELECTED_D: 'Option Selected — Awaiting Booking',
  REVISION_PENDING_A: 'Revision Pending Review',
  CONFIRMED: 'Confirmed',
};

export function getStatusColor(status) {
  return STATUS_COLORS[status] || 'bg-slate-100 text-slate-600';
}

export function getStatusLabel(status) {
  return STATUS_DISPLAY_LABELS[status] || status;
}