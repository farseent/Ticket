import { useState } from 'react';

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-slate-500 mb-1 block">{label}</label>
      {children}
    </div>
  );
}

export default function OptionForm({ onSubmit }) {
  const [form, setForm] = useState({
    airline: '', route: '', departureAirport: '', arrivalAirport: '',
    departTime: '', arriveTime: '', price: '', layovers: '', notes: '',
  });

  const inputClass = "w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400";
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(form);
    setForm({
      airline: '', route: '', departureAirport: '', arrivalAirport: '',
      departTime: '', arriveTime: '', price: '', layovers: '', notes: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <h3 className="font-medium text-sm text-slate-700">Submit a Flight Option</h3>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Airline">
          <input placeholder="e.g. Emirates" value={form.airline} onChange={update('airline')} className={inputClass} required />
        </Field>
        <Field label="Route">
          <input placeholder="e.g. CCJ → DOH → DXB" value={form.route} onChange={update('route')} className={inputClass} required />
        </Field>
        <Field label="Departure Airport">
          <input placeholder="e.g. CCJ" value={form.departureAirport} onChange={update('departureAirport')} className={inputClass} required />
        </Field>
        <Field label="Arrival Airport">
          <input placeholder="e.g. DXB" value={form.arrivalAirport} onChange={update('arrivalAirport')} className={inputClass} required />
        </Field>
        <Field label="Departure Time">
          <input type="time" value={form.departTime} onChange={update('departTime')} className={inputClass} />
        </Field>
        <Field label="Arrival Time">
          <input type="time" value={form.arriveTime} onChange={update('arriveTime')} className={inputClass} />
        </Field>
        <Field label="Price">
          <input placeholder="e.g. 4200" type="number" value={form.price} onChange={update('price')} className={inputClass} required />
        </Field>
        <Field label="Layovers">
          <input placeholder="e.g. 1 stop in Doha" value={form.layovers} onChange={update('layovers')} className={inputClass} />
        </Field>
      </div>
      <button type="submit" className="w-full bg-indigo-600 text-white rounded-lg py-1.5 text-sm font-medium hover:bg-indigo-700 transition-colors">
        Submit Option
      </button>
    </form>
  );
}