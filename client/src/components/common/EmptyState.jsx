export default function EmptyState({ message = 'Nothing here yet.' }) {
  return <p className="text-gray-400 text-sm text-center py-6">{message}</p>;
}