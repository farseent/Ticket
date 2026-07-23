import { ROLE_LABELS } from '../../utils/constants';
import { getActionLabel } from '../../utils/actionLabels';

export default function AuditLogViewer({ logs }) {
  return (
    <ul className="text-sm space-y-2 max-h-96 overflow-y-auto">
      {logs.map((log) => (
        <li key={log._id} className="border-b border-slate-100 pb-2">
          <div className="flex justify-between items-baseline gap-2">
            <span className="font-semibold text-slate-800">{getActionLabel(log.actionType)}</span>
            <span className="text-xs text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {ROLE_LABELS[log.actorRole]}{log.actorId?.name ? ` · ${log.actorId.name}` : ''}
          </div>
        </li>
      ))}
      {logs.length === 0 && <li className="text-slate-400 text-sm">No entries yet.</li>}
    </ul>
  );
}