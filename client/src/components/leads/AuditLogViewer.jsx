import { ROLE_LABELS, ROLE_COLORS } from '../../utils/constants';
import { getActionLabel } from '../../utils/actionLabels';
import { getActionDetail } from '../../utils/auditLogDetails';

export default function AuditLogViewer({ logs }) {
  return (
    <ul className="text-sm space-y-3 max-h-112 overflow-y-auto">
      {logs.map((log) => {
        const detail = getActionDetail(log);
        return (
          <li key={log._id} className="border-b border-slate-100 pb-3 last:border-0">
            <div className="flex justify-between items-baseline gap-3">
              <span className="font-semibold text-slate-800">{getActionLabel(log.actionType)}</span>
              <span className="text-xs text-slate-400 font-mono shrink-0">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${ROLE_COLORS[log.actorRole] || 'bg-slate-300'}`} />
              <span className="text-xs text-slate-500">
                {ROLE_LABELS[log.actorRole]}{log.actorId?.name ? ` · ${log.actorId.name}` : ''}
              </span>
            </div>
            {detail && (
              <p className="text-sm text-slate-600 mt-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5">
                {detail}
              </p>
            )}
          </li>
        );
      })}
      {logs.length === 0 && <li className="text-slate-400 text-sm">No entries yet.</li>}
    </ul>
  );
}