import { FIELD_LABELS, formatFieldValue } from '../../utils/fieldLabels';

export default function RevisionHistoryList({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
      <h3 className="text-xs font-medium text-blue-800 uppercase tracking-wide mb-2">
        Client Revision Requests
      </h3>
      <ul className="space-y-3">
        {history.map((entry, i) => (
          <li key={i} className="text-sm text-blue-900">
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
        ))}
      </ul>
    </div>
  );
}