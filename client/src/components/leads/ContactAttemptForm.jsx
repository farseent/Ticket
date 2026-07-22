import { useState } from 'react';
import { CONTACT_OUTCOMES } from '../../utils/constants';

export default function ContactAttemptForm({ onSubmit }) {
  const [outcome, setOutcome] = useState('REACHED');

  return (
    <div>
      <h3 className="font-medium text-sm text-slate-700 mb-2">Client Contact</h3>
      <div className="flex gap-2 items-center">
        <select
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
        >
          {CONTACT_OUTCOMES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={() => onSubmit(outcome)}
          className="bg-slate-700 text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          Log Contact Attempt
        </button>
      </div>
    </div>
  );
}