export default function RevisionHistoryList({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
      <h3 className="text-xs font-medium text-blue-800 uppercase tracking-wide mb-2">
        Client Revision Requests
      </h3>
      <ul className="space-y-2">
        {history.map((entry, i) => (
          <li key={i} className="text-sm text-blue-900">
            <span className="font-mono text-xs text-blue-500 mr-2">Round {entry.round}</span>
            {entry.reason}
          </li>
        ))}
      </ul>
    </div>
  );
}