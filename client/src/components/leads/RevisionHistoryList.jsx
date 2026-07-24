import { useState } from 'react';
import { FIELD_LABELS, formatFieldValue } from '../../utils/fieldLabels';

function RevisionEntry({ entry }) {
  return (
    <li className="text-sm text-blue-900">
      <div><span className="font-mono text-xs text-blue-500 mr-2">Round {entry.round}</span>{entry.reason}</div>
      {entry.fieldChanges?.length > 0 && (
        <ul className="mt-1 ml-6 space-y-0.5 text-xs text-blue-700">
          {entry.fieldChanges.map((fc, j) => (
            <li key={j}>
              <span className="font-medium">{FIELD_LABELS[fc.field] || fc.field}:</span>{' '}
              {formatFieldValue(fc.field, fc.oldValue)} → {formatFieldValue(fc.field, fc.newValue)}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

// mode="latest": shows only the most recent entry prominently, with the rest collapsed behind a toggle.
// mode="full": always shows the entire history (used for A's audit-focused views).
export default function RevisionHistoryList({ history, mode = 'full' }) {
  const [showAll, setShowAll] = useState(false);
  if (!history || history.length === 0) return null;

  if (mode === 'full') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
        <h3 className="text-xs font-medium text-blue-800 uppercase tracking-wide mb-2">Client Revision Requests</h3>
        <ul className="space-y-3">
          {history.map((entry, i) => <RevisionEntry key={i} entry={entry} />)}
        </ul>
      </div>
    );
  }

  const latest = history[history.length - 1];
  const earlier = history.slice(0, -1);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
      <h3 className="text-xs font-medium text-blue-800 uppercase tracking-wide mb-2">Latest Client Change</h3>
      <ul className="space-y-3">
        <RevisionEntry entry={latest} />
      </ul>

      {earlier.length > 0 && (
        <div className="mt-2 pt-2 border-t border-blue-200">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            {showAll ? '▾' : '▸'} Earlier rounds ({earlier.length})
          </button>
          {showAll && (
            <ul className="space-y-3 mt-2">
              {earlier.map((entry, i) => <RevisionEntry key={i} entry={entry} />)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}