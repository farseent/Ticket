import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { notifyError } from '../utils/toast'

const ROLES = [
  { value: 'A', label: 'Role A — Sales Executive' },
  { value: 'B', label: 'Role B — Ticketing Agent' },
  { value: 'C', label: 'Role C — Ticketing Staff' },
  { value: 'D', label: 'Role D — Ticketing Executive' },
];

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'A' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  const inputClass = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 w-96 space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Create Account</h1>
        <input
          placeholder="Full Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClass} required
        />
        <input
          type="email" placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputClass} required
        />
        <input
          type="password" placeholder="Password (min 6 characters)" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className={inputClass} required minLength={6}
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className={inputClass}
        >
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <button type="submit" className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition-colors">
          Sign Up
        </button>
        <p className="text-sm text-slate-500 text-center">
          Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}