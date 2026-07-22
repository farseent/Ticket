import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import LeadPipelineMini from './LeadPipelineMini';

export default function LeadTable({ leads, onViewAuditLog }) {
  if (leads.length === 0) return <EmptyState message="No leads match your search." />;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100">
          <th className="py-3 px-4">Client</th>
          <th className="py-3 px-4">Flow</th>
          <th className="py-3 px-4">Progress</th>
          <th className="py-3 px-4">Status</th>
          <th className="py-3 px-4">Round</th>
          <th className="py-3 px-4"></th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => (
          <tr key={lead._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
            <td className="py-3 px-4 font-medium text-slate-800">{lead.clientName}</td>
            <td className="py-3 px-4 text-slate-500">{lead.flowType ? lead.flowType.replace('_', ' ') : '—'}</td>
            <td className="py-3 px-4"><LeadPipelineMini status={lead.status} /></td>
            <td className="py-3 px-4"><StatusBadge status={lead.status} /></td>
            <td className="py-3 px-4 font-mono text-slate-500">{lead.currentRevisionRound}</td>
            <td className="py-3 px-4 text-right">
              <button onClick={() => onViewAuditLog(lead._id)} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">
                Audit log →
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}