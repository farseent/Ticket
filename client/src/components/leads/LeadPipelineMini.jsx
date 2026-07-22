import { getStageIndex, STAGE_LABELS } from '../../utils/pipelineStage';

export default function LeadPipelineMini({ status }) {
  const activeIndex = getStageIndex(status);
  const isRevision = status === 'REVISION_REQUESTED';
  const isConfirmed = status === 'CONFIRMED';

  return (
    <div className="flex items-center" title={STAGE_LABELS[activeIndex]}>
      {STAGE_LABELS.map((label, i) => {
        const filled = i <= activeIndex;
        let dot = 'bg-slate-200';
        if (filled) dot = isConfirmed ? 'bg-emerald-500' : isRevision && i === activeIndex ? 'bg-rose-500' : 'bg-indigo-500';
        const line = i < activeIndex ? (isConfirmed ? 'bg-emerald-300' : 'bg-indigo-300') : 'bg-slate-200';
        return (
          <span key={label} className="flex items-center">
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            {i < STAGE_LABELS.length - 1 && <span className={`w-3 h-px ${line}`} />}
          </span>
        );
      })}
    </div>
  );
}