import { useAuth } from '../../hooks/useAuth';
import { ROLE_LABELS, ROLE_COLORS } from '../../utils/constants';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${ROLE_COLORS[user.role]} text-white flex items-center justify-center font-semibold`}>
          {user.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{ROLE_LABELS[user.role]} Dashboard</h1>
          <p className="text-sm text-slate-500">{user.name}</p>
        </div>
      </div>
      <button
        onClick={logout}
        className="text-sm text-slate-500 hover:text-rose-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:border-rose-200 transition-colors"
      >
        Log out
      </button>
    </div>
  );
}