'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, type GiftCategory } from '@/lib/supabase';

interface Props {
  userEmail: string;
}

export default function NewVoucherForm({ userEmail }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<GiftCategory[]>([]);

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    phone: '',
    gifter_name: '',
    gifter_email: '',
    package_name: '',
    category_id: '',
    package_notes: '',
    amount: '',
    currency: 'EUR',
    checkin_date: '',
    checkout_date: '',
    expires_at: '',
    notes: '',
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    supabase.from('gift_categories').select('*').eq('active', true).order('name')
      .then(({ data }) => { if (data) setCategories(data); });
  }, []);

  const handleCategoryChange = (catId: string) => {
    set('category_id', catId);
    const cat = categories.find(c => c.id === catId);
    if (cat) {
      set('package_name', cat.name);
      if (cat.elements && cat.elements.length > 0) {
        set('package_notes', cat.elements.join('\n'));
      }
      if (cat.base_price) set('amount', cat.base_price.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/vouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, created_by: userEmail }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || 'Failed to create voucher.');
      setLoading(false);
      return;
    }
    router.push(`/vouchers/${json.code}`);
  };

  const defaultExpiry = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  })();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* STEP 1 — Recipient */}
      <div className="card p-6">
        <h2 className="font-semibold text-charcoal-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gold-100 text-gold-700 text-xs flex items-center justify-center font-bold">1</span>
          Të dhënat e marrësit (Recipient)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Emri Mbiemri *</label>
            <input type="text" required value={form.customer_name}
              onChange={e => set('customer_name', e.target.value)}
              placeholder="p.sh. Ana Kelmendi" className="input-field" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" required value={form.customer_email}
              onChange={e => set('customer_email', e.target.value)}
              placeholder="ana@email.com" className="input-field" />
          </div>
          <div>
            <label className="label">Telefon</label>
            <input type="tel" value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="+355 69 XXX XXXX" className="input-field" />
          </div>
        </div>
      </div>

      {/* STEP 2 — Gifter */}
      <div className="card p-6">
        <h2 className="font-semibold text-charcoal-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gold-100 text-gold-700 text-xs flex items-center justify-center font-bold">2</span>
          Dhuruesit (Gifter)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Emri Mbiemri</label>
            <input type="text" value={form.gifter_name}
              onChange={e => set('gifter_name', e.target.value)}
              placeholder="p.sh. Besnik Hoxha" className="input-field" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={form.gifter_email}
              onChange={e => set('gifter_email', e.target.value)}
              placeholder="besnik@email.com" className="input-field" />
          </div>
        </div>
      </div>

      {/* STEP 3 — Package */}
      <div className="card p-6">
        <h2 className="font-semibold text-charcoal-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gold-100 text-gold-700 text-xs flex items-center justify-center font-bold">3</span>
          Paketa &amp; Vlera
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.length > 0 && (
            <div className="sm:col-span-2">
              <label className="label">Zgjidh Kategori</label>
              <select value={form.category_id}
                onChange={e => handleCategoryChange(e.target.value)}
                className="input-field">
                <option value="">-- Zgjidh nga kategorite --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.base_price ? ` — €${c.base_price}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="label">Emri i Paketës *</label>
            <input type="text" required value={form.package_name}
              onChange={e => set('package_name', e.target.value)}
              placeholder="p.sh. Romantic Weekend" className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Çfarë përfshin paketa (e sheh dhe klienti)</label>
            <textarea value={form.package_notes}
              onChange={e => set('package_notes', e.target.value)}
              placeholder={"1 natë akomodim\nMëngjes për 2 persona\nSpa tratament 60 min"}
              rows={4} className="input-field resize-none" />
            <p className="text-xs text-charcoal-400 mt-1">Çdo element në rresht të ri</p>
          </div>
          <div>
            <label className="label">Shuma *</label>
            <input type="number" required min="1" step="0.01"
              value={form.amount} onChange={e => set('amount', e.target.value)}
              placeholder="150.00" className="input-field" />
          </div>
          <div>
            <label className="label">Valuta</label>
            <select value={form.currency} onChange={e => set('currency', e.target.value)} className="input-field">
              <option value="EUR">EUR €</option>
              <option value="ALL">ALL L</option>
              <option value="USD">USD $</option>
            </select>
          </div>
        </div>
      </div>

      {/* STEP 4 — Dates */}
      <div className="card p-6">
        <h2 className="font-semibold text-charcoal-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gold-100 text-gold-700 text-xs flex items-center justify-center font-bold">4</span>
          Datat
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Check-in</label>
            <input type="date" value={form.checkin_date}
              onChange={e => set('checkin_date', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Check-out</label>
            <input type="date" value={form.checkout_date}
              min={form.checkin_date}
              onChange={e => set('checkout_date', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Valid deri *</label>
            <input type="date" required
              min={new Date().toISOString().split('T')[0]}
              value={form.expires_at || defaultExpiry}
              onChange={e => set('expires_at', e.target.value)} className="input-field" />
          </div>
        </div>
      </div>

      {/* STEP 5 — Internal notes */}
      <div className="card p-6">
        <h2 className="font-semibold text-charcoal-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gold-100 text-gold-700 text-xs flex items-center justify-center font-bold">5</span>
          Shënime Interne
        </h2>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
          placeholder="Shënime interne (nuk shihen nga klienti)..."
          rows={3} className="input-field resize-none" />
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()} className="btn-outline">Anulo</button>
        <button type="submit" disabled={loading} className="btn-gold flex-1 justify-center">
          {loading ? 'Duke krijuar...' : '+ Krijo Gift Card'}
        </button>
      </div>
    </form>
  );
}
