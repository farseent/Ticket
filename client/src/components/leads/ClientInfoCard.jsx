export default function ClientInfoCard({ lead, showPhone = true }) {
  if (!lead) return null;

  return (
    <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
      {/* Phone Field */}
      {showPhone && lead.clientPhone && (
        <div>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Client Phone
          </span>
          <a
            href={`tel:${lead.clientPhone}`}
            className="text-sm font-mono font-semibold text-indigo-600 hover:underline"
          >
            {lead.clientPhone}
          </a>
        </div>
      )}

      {/* Notes Field */}
      {lead.clientNotes && (
        <div>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Client Notes
          </span>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-snug">
            {lead.clientNotes}
          </p>
        </div>
      )}

      {!lead.clientNotes && (!showPhone || !lead.clientPhone) && (
        <p className="text-xs text-slate-400 italic">No notes or contact provided.</p>
      )}
    </div>
  );
}