import EmptyState from '../common/EmptyState';

export default function OptionsList({ options, selectedOptionId, onSelect, canSelect, currentRound }) {
  if (!options || options.length === 0) return <EmptyState message="No options submitted yet." />;

  return (
    <ul className="space-y-2">
      {options.map((opt) => {
        const isSelected = selectedOptionId && String(selectedOptionId) === String(opt._id);
        const isPastRound = currentRound !== undefined && opt.round < currentRound;
        return (
          <li
            key={opt._id}
            className={`border rounded-lg p-3 flex justify-between items-center transition-colors ${
              isSelected
                ? 'border-emerald-300 bg-emerald-50/50'
                : isPastRound
                ? 'border-slate-100 bg-slate-50/50 opacity-60'
                : 'border-slate-100'
            }`}
          >
            <div>
              <div className="font-medium text-sm text-slate-800 flex items-center gap-2">
                {opt.airline} — {opt.route}
                {isSelected && <span className="text-emerald-600 text-xs font-semibold">✓ Client agreed</span>}
                {isPastRound && <span className="text-slate-400 text-xs font-medium">Previous round</span>}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {opt.layovers ? `${opt.layovers}` : 'Direct'}
                {opt.submittedBy?.name ? ` · ${opt.submittedBy.name}` : ''}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="font-mono font-semibold text-slate-800 text-sm">${opt.price}</div>
              {canSelect && !isSelected && !isPastRound && (
                <button
                  onClick={() => onSelect(opt._id)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-lg px-2.5 py-1 hover:bg-indigo-50 transition-colors"
                >
                  Select
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}