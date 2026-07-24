import { useState } from 'react';

export default function OptionForm({ onSubmit }) {
  const [form, setForm] = useState({
    airline: '', route: '', departTime: '', arriveTime: '', price: '', layovers: '', notes: '',
  });

  const inputClass = "border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400";
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(form);
    setForm({ airline: '', route: '', departTime: '', arriveTime: '', price: '', layovers: '', notes: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <h3 className="font-medium text-sm text-slate-700">Submit a Flight Option</h3>
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Airline" value={form.airline} onChange={update('airline')} className={inputClass} required />
        <input placeholder="Route" value={form.route} onChange={update('route')} className={inputClass} required />
        <input type="time" placeholder="Depart Time" value={form.departTime} onChange={update('departTime')} className={inputClass} />
        <input type="time" placeholder="Arrive Time" value={form.arriveTime} onChange={update('arriveTime')} className={inputClass} />
        <input placeholder="Price" type="number" value={form.price} onChange={update('price')} className={inputClass} required />
        <input placeholder="Layovers" value={form.layovers} onChange={update('layovers')} className={inputClass} />
      </div>
      <button type="submit" className="w-full bg-indigo-600 text-white rounded-lg py-1.5 text-sm font-medium hover:bg-indigo-700 transition-colors">
        Submit Option
      </button>
    </form>
  );
}