import { ROLE_LABELS } from '../../utils/constants';

export default function DispatcherStatePanel({ state }) {
  if (!state) return null;
  return (
    <div className="mb-6 bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <span className="font-medium text-slate-700">Dispatcher</span>
      <span className="flex items-center gap-1.5 text-slate-500">
        Next turn
        <span className="font-mono font-semibold text-indigo-600">
          {state.stage1Toggle === 'B_TURN' ? ROLE_LABELS.B : ROLE_LABELS.C}
        </span>
      </span>
      {/* <span className="flex items-center gap-1.5 text-slate-500">
        {ROLE_LABELS.B} pointer <span className="font-mono font-semibold text-slate-800">{state.bPointerIndex}</span>
      </span>
      <span className="flex items-center gap-1.5 text-slate-500">
        {ROLE_LABELS.D} pointer <span className="font-mono font-semibold text-slate-800">{state.dPointerIndex}</span>
      </span> */}
    </div>
  );
}