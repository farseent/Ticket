export const FIELD_LABELS = {
  destination: 'Destination',
  travelDate: 'Travel Date',
  departureAirport: 'Departure Airport',
  preferredTime: 'Preferred Time',
  'passengers.adults': 'Adults',
  'passengers.children': 'Children',
};

export function formatFieldValue(field, value) {
  if (field === 'travelDate' && value) return new Date(value).toLocaleDateString();
  return value;
}