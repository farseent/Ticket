import StatusBadge from '../common/StatusBadge';
import LeadPipelineMini from './LeadPipelineMini';
import OptionsList from './OptionsList';
import ClientInfoCard from './ClientInfoCard';
import ErrorBanner from '../common/ErrorBanner';

export default function LeadDetailPanel({ detail, error, onSelectOption, canSelectOption, showClientPhone = true, children }) {
  const selected = detail.lead.selectedOption;

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

      <ClientInfoCard lead={detail.lead} showPhone={showClientPhone} />

      {detail.lead.currentRoundInstructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-800">
          <span className="font-medium">Client requested change:</span> {detail.lead.currentRoundInstructions}
        </div>
      )}

      {selected && detail.lead.status !== 'CONFIRMED' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm text-emerald-800">
          <span className="font-medium">Client currently agreed to:</span>{' '}
          {selected.airline} — {selected.route} — ${selected.price}
          <div className="text-xs text-emerald-600 mt-0.5">Not booked yet. Client can still change their mind.</div>
        </div>
      )}

      {selected && detail.lead.status === 'CONFIRMED' && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700">
          <span className="font-medium">Booked:</span> {selected.airline} — {selected.route} — ${selected.price}
        </div>
      )}

      <div className="border-t border-slate-100 pt-4">
        <h3 className="font-medium text-sm text-slate-700 mb-2">Submitted Options</h3>
        <OptionsList
          options={detail.options}
          selectedOptionId={selected?._id}
          onSelect={onSelectOption}
          canSelect={canSelectOption}
          currentRound={detail.lead.flowType === 'MULTI_AGENT' ? detail.lead.currentRevisionRound : undefined}
        />
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-4">
        {children}
      </div>
    </div>
  );
}