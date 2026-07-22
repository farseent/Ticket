export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-2 text-gray-500 text-sm py-6 justify-center">
      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      {label}
    </div>
  );
}