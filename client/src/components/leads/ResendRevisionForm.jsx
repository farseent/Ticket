import { useState } from 'react';

const PREFERRED_TIME_OPTIONS = [
  { value: 'ANY', label: 'Any time' },
  { value: 'MORNING', label: 'Morning' },
  { value: 'AFTERNOON', label: 'Afternoon' },
  { value: 'EVENING', label: 'Evening' },
  { value: 'NIGHT', label: 'Night' },
];

export default function ResendRevisionForm({ lead, onSubmit, busy }) {
  const [form, setForm] = useState({
    destination: lead.destination || '',
    travelDate: lead.travelDate ? new Date(lead.travelDate).toISOString().slice(0, 10) : '',
    departureAirport: lead.departureAirport || '',
    preferredTime: lead.preferredTime || 'ANY',
    adults: lead.passengers?.adults ?? 1,
    children: lead.passengers?.children ?? 0,
    clientNotes: lead.clientNotes
  });

  const inputClass = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400";

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      destination: form.destination,
      travelDate: form.travelDate,
      departureAirport: form.departureAirport,
      preferredTime: form.preferredTime,
      passengers: { adults: Number(form.adults), children: Number(form.children) },
      clientNotes: form.clientNotes
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800">
        <span className="font-medium">Client requested:</span> {lead.pendingRevisionReason}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Destination" value={form.destination}
          onChange={(e) => setForm({ ...form, destination: e.target.value })} className={inputClass} required />
        <input type="date" value={form.travelDate}
          onChange={(e) => setForm({ ...form, travelDate: e.target.value })} className={inputClass} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Departure Airport" value={form.departureAirport}
          onChange={(e) => setForm({ ...form, departureAirport: e.target.value })} className={inputClass} required />
        <select value={form.preferredTime}
          onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} className={inputClass}>
          {PREFERRED_TIME_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500">Adults</label>
          <input type="number" min="1" value={form.adults}
            onChange={(e) => setForm({ ...form, adults: e.target.value })} className={inputClass} required />
        </div>
        <div>
          <label className="text-xs text-slate-500">Children</label>
          <input type="number" min="0" value={form.children}
            onChange={(e) => setForm({ ...form, children: e.target.value })} className={inputClass} />
        </div>
      </div>
      <textarea
            placeholder="Additional Notes (optional)" value={form.clientNotes}
            onChange={(e) => setForm({ ...form, clientNotes: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />
      <button type="submit" disabled={busy}
        className="w-full bg-amber-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50">
        Confirm Changes & Resend to C Group
      </button>
    </form>
  );
}