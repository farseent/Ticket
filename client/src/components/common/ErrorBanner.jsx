export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2">
      {message}
    </div>
  );
}