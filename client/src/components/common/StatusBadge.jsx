import { getStatusColor } from '../../utils/statusLabels';

export default function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}