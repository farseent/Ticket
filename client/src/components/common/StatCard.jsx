export default function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
      <div className={`w-1.5 h-10 rounded-full ${accent}`} />
      <div>
        <div className="text-2xl font-bold text-slate-900 font-mono">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}