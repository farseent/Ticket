export default function RevisionPendingCard({ lead, onResend, busy }) {
  return (
    <div className="bg-white border border-amber-200 rounded-xl p-4 flex items-start justify-between gap-4">
      <div>
        <div className="font-medium text-slate-800">{lead.clientName}</div>
        <p className="text-sm text-slate-600 mt-1">{lead.pendingRevisionReason}</p>
      </div>
      <button
        onClick={() => onResend(lead._id)}
        disabled={busy}
        className="shrink-0 bg-amber-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-amber-700 transition-colors disabled:opacity-50"
      >
        Resend to C Group
      </button>
    </div>
  );
}