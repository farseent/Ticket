import { useState } from 'react';
import EmptyState from '../common/EmptyState';

function OptionCard({ opt, isSelected, canSelect, onSelect }) {
  return (
    <li className={`border rounded-lg p-3 transition-colors ${
      isSelected ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-100 bg-slate-50/50'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium text-sm text-slate-800 flex items-center gap-2">
            {opt.airline} — {opt.route}
            {opt.departureAirport && opt.arrivalAirport && (
              <span className="text-xs font-normal text-slate-400">({opt.departureAirport} → {opt.arrivalAirport})</span>
            )}
            {isSelected && <span className="text-emerald-600 text-xs font-semibold">✓ Client agreed</span>}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {opt.layovers ? `${opt.layovers} layover(s)` : 'Direct'}
            {opt.submittedBy?.name ? ` · ${opt.submittedBy.name}` : ''}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="font-mono font-semibold text-slate-800 text-sm">${opt.price}</div>
          {canSelect && !isSelected && (
            <button
              onClick={() => onSelect(opt._id)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-lg px-2.5 py-1 hover:bg-indigo-50 transition-colors"
            >
              Select
            </button>
          )}
        </div>
      </div>
      {(opt.departTime || opt.arriveTime || opt.notes) && (
        <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
          {(opt.departTime || opt.arriveTime) && (
            <div><span className="font-medium text-slate-600">Timing:</span> {opt.departTime || '—'} → {opt.arriveTime || '—'}</div>
          )}
          {opt.notes && <div><span className="font-medium text-slate-600">Notes:</span> {opt.notes}</div>}
        </div>
      )}
    </li>
  );
}

export default function OptionsList({ options, selectedOptionId, onSelect, canSelect, currentRound }) {
  const [showPrevious, setShowPrevious] = useState(false);

  if (!options || options.length === 0) return <EmptyState message="No options submitted yet." />;

  const currentOptions = currentRound !== undefined ? options.filter((o) => o.round >= currentRound) : options;
  const previousOptions = currentRound !== undefined ? options.filter((o) => o.round < currentRound) : [];

  return (
    <div className="space-y-3">
      {currentOptions.length === 0 ? (
        <EmptyState message="No options submitted for the current round yet." />
      ) : (
        <ul className="space-y-2">
          {currentOptions.map((opt) => (
            <OptionCard
              key={opt._id} opt={opt}
              isSelected={selectedOptionId && String(selectedOptionId) === String(opt._id)}
              canSelect={canSelect} onSelect={onSelect}
            />
          ))}
        </ul>
      )}

      {previousOptions.length > 0 && (
        <div>
          <button
            onClick={() => setShowPrevious((v) => !v)}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            {showPrevious ? '▾' : '▸'} Previous rounds ({previousOptions.length})
          </button>
          {showPrevious && (
            <ul className="space-y-2 mt-2">
              {previousOptions.map((opt) => (
                <OptionCard
                  key={opt._id} opt={opt}
                  isSelected={selectedOptionId && String(selectedOptionId) === String(opt._id)}
                  canSelect={canSelect} onSelect={onSelect}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}