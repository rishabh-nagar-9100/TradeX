import { Plus } from 'lucide-react';
import { useState } from 'react';

const DEFAULT_FORM = {
  symbol: 'AAPL',
  companyName: 'Apple Inc.',
  sector: 'Technology',
  type: 'BUY',
  quantity: 1,
  price: 250,
  fees: 0
};

export default function TransactionForm({ onSubmit }) {
  const [form, setForm] = useState(DEFAULT_FORM);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      quantity: Number(form.quantity),
      price: Number(form.price),
      fees: Number(form.fees)
    });
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-7">
      <input value={form.symbol} onChange={(event) => updateField('symbol', event.target.value)} className="rounded-lg bg-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 md:col-span-1" placeholder="Symbol" />
      <input value={form.companyName} onChange={(event) => updateField('companyName', event.target.value)} className="rounded-lg bg-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 md:col-span-2" placeholder="Company" />
      <input value={form.sector} onChange={(event) => updateField('sector', event.target.value)} className="rounded-lg bg-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 md:col-span-1" placeholder="Sector" />
      <select value={form.type} onChange={(event) => updateField('type', event.target.value)} className="rounded-lg bg-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800">
        <option value="BUY">Buy</option>
        <option value="SELL">Sell</option>
      </select>
      <input type="number" min="0.000001" step="0.000001" value={form.quantity} onChange={(event) => updateField('quantity', event.target.value)} className="rounded-lg bg-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800" placeholder="Qty" />
      <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => updateField('price', event.target.value)} className="rounded-lg bg-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800" placeholder="Price" />
      <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 md:col-span-7">
        <Plus className="h-4 w-4" />
        Add Transaction
      </button>
    </form>
  );
}
