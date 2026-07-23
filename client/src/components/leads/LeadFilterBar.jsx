export default function LeadFilterBar({ search, onSearchChange, statusFilter, onStatusFilterChange, filters }) {
  return (
    <div className="flex flex-wrap gap-2 items-center px-4 py-3 border-b border-slate-100">
      <input
        placeholder="Search by client name..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
      />
      <div className="flex gap-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => onStatusFilterChange(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === f.key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}