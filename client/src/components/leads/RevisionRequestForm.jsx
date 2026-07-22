import { useState } from 'react';

export default function RevisionRequestForm({ onSubmit }) {
  const [reason, setReason] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    await onSubmit(reason);
    setReason('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <h3 className="font-medium text-sm text-slate-700">Request Revision</h3>
      <textarea
        placeholder="What needs to change? (e.g. earlier departure, lower budget)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400"
        required
      />
      <button
        type="submit"
        className="w-full bg-rose-600 text-white rounded-lg py-1.5 text-sm font-medium hover:bg-rose-700 transition-colors"
      >
        Send Back to Role C for Revision
      </button>
    </form>
  );
}