export const CONTACT_OUTCOMES = [
  { value: 'REACHED', label: 'Reached' },
  { value: 'NO_ANSWER', label: 'No Answer' },
  { value: 'VOICEMAIL', label: 'Voicemail' },
  { value: 'CALLBACK_REQUESTED', label: 'Callback Requested' },
];

export const ROLE_LABELS = {
  A: 'Sales Executive',
  B: 'Ticketing Agent',
  C: 'Ticketing Staff',
  D: 'Ticketing Executive',
};

// Added: gives each role a consistent identity color across the UI
export const ROLE_COLORS = {
  A: 'bg-indigo-600',
  B: 'bg-blue-600',
  C: 'bg-violet-600',
  D: 'bg-amber-600',
};