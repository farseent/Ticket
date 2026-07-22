export default function NotFound({ message = 'Page not found.' }) {
  return <div className="p-6 text-gray-500">{message}</div>;
}