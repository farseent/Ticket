import StatusBadge from '../common/StatusBadge';
import LeadPipelineMini from './LeadPipelineMini';
import OptionsList from './OptionsList';
import ErrorBanner from '../common/ErrorBanner';

export default function LeadDetailPanel({ detail, error, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-5">
      <ErrorBanner message={error} />

      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-semibold text-slate-900">{detail.lead.clientName}</h2>
          <div className="mt-1.5"><StatusBadge status={detail.lead.status} /></div>
        </div>
        <LeadPipelineMini status={detail.lead.status} />
      </div>

      <div className="border-t border-slate-100 pt-4">
        <h3 className="font-medium text-sm text-slate-700 mb-2">Submitted Options</h3>
        <OptionsList options={detail.options} />
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-4">
        {children}
      </div>
    </div>
  );
}