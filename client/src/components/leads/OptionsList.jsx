import EmptyState from '../common/EmptyState';

export default function OptionsList({ options }) {
  if (!options || options.length === 0) return <EmptyState message="No options submitted yet." />;

  return (
    <ul className="space-y-2">
      {options.map((opt) => (
        <li key={opt._id} className="border border-slate-100 rounded-lg p-3 flex justify-between items-center">
          <div>
            <div className="font-medium text-sm text-slate-800">{opt.airline} — {opt.route}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {opt.layovers ? `${opt.layovers} layover(s)` : 'Direct'}
              {opt.submittedBy?.name ? ` · ${opt.submittedBy.name}` : ''}
            </div>
          </div>
          <div className="font-mono font-semibold text-slate-800 text-sm">${opt.price}</div>
        </li>
      ))}
    </ul>
  );
}