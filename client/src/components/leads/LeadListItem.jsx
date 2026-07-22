import StatusBadge from '../common/StatusBadge';
import LeadPipelineMini from './LeadPipelineMini';

export default function LeadListItem({ lead, isActive, onClick, meta }) {
  return (
    <li
      onClick={() => onClick(lead._id)}
      className={`p-3 border-l-2 cursor-pointer transition-colors ${
        isActive ? 'border-indigo-600 bg-indigo-50/60' : 'border-transparent hover:bg-slate-50'
      }`}
    >
      <div className="font-medium text-slate-800 text-sm">{lead.clientName}</div>
      <div className="mt-1.5 flex items-center justify-between">
        <StatusBadge status={lead.status} />
        <LeadPipelineMini status={lead.status} />
      </div>
      {meta && <div className="mt-1.5">{meta}</div>}
    </li>
  );
}