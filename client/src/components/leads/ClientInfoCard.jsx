const PREFERRED_TIME_LABELS = {
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  EVENING: 'Evening',
  NIGHT: 'Night',
  ANY: 'Any time',
};

export default function ClientInfoCard({ lead, showPhone = true }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {showPhone && (
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Client Phone</span>
            <div>
              <a href={`tel:${lead.clientPhone}`} className="text-sm font-mono font-semibold text-indigo-600 hover:text-indigo-800">
                {lead.clientPhone}
              </a>
            </div>
          </div>
        )}
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Destination</span>
          <div className="text-sm font-medium text-slate-800">{lead.destination}</div>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Travel Date</span>
          <div className="text-sm text-slate-700">
            {lead.travelDate ? new Date(lead.travelDate).toLocaleDateString() : '—'}
          </div>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Departure Airport</span>
          <div className="text-sm text-slate-700">{lead.departureAirport}</div>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Preferred Time</span>
          <div className="text-sm text-slate-700">{PREFERRED_TIME_LABELS[lead.preferredTime] || lead.preferredTime}</div>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Passengers</span>
          <div className="text-sm text-slate-700">
            {lead.passengers?.adults ?? 0} Adult{lead.passengers?.adults === 1 ? '' : 's'}
            {lead.passengers?.children > 0 ? `, ${lead.passengers.children} Child${lead.passengers.children === 1 ? '' : 'ren'}` : ''}
          </div>
        </div>
      </div>

      {lead.clientNotes && (
        <div className="pt-2 border-t border-slate-200">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Client Notes</span>
          <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{lead.clientNotes}</p>
        </div>
      )}
    </div>
  );
}