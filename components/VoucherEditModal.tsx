'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Voucher } from '@/lib/supabase';

interface Props {
  voucher: Voucher;
  onClose: () => void;
}

export default function VoucherEditModal({ voucher, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    customer_name: voucher.customer_name || '',
    customer_email: voucher.customer_email || '',
    phone: voucher.phone || '',
    gifter_name: voucher.gifter_name || '',
    gifter_email: voucher.gifter_email || '',
    package_name: voucher.package_name || '',
    package_notes: voucher.package_notes || '',
    amount: voucher.amount?.toString() || '',
    currency: voucher.currency || 'EUR',
    checkin_date: voucher.checkin_date || '',
    checkout_date: voucher.checkout_date || '',
    expires_at: voucher.expires_at ? voucher.expires_at.split('T')[0] : '',
    notes: voucher.notes || '',
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setLoading(true);
    setError('');

    const res = await fetch(`/api/vouchers/${voucher.code}/edit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || 'Gabim gjatë ruajtjes.');
      setLoading(false);
      return;
    }

    router.refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.5)'}}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-semibold text-charcoal-800">Ndrysho Gift Card</h2>
            <p className="text-xs text-charcoal-400 font-mono mt-0.5">{voucher.code}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-charcoal-100 text-charcoal-500 transition-colors">✕</button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-xs font-semibold text-gold-600 uppercase tracking-wider mb-3">Marrësi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="label">Emri Mbiemri *</label>
                <input type="text" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">Email *</label>
                <input type="email" value={form.customer_email} onChange={e => set('customer_email', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">Telefon</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="input-field" />
              </div>
            </div>
          </div>

          <div className="h-px bg-charcoal-100" />

          <div>
            <h3 className="text-xs font-semibold text-gold-600 uppercase tracking-wider mb-3">Dhuruesit</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Emri Mbiemri</label>
                <input type="text" value={form.gifter_name} onChange={e => set('gifter_name', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" value={form.gifter_email} onChange={e => set('gifter_email', e.target.value)} className="input-field" />
              </div>
            </div>
          </div>

          <div className="h-px bg-charcoal-100" />

          <div>
            <h3 className="text-xs font-semibold text-gold-600 uppercase tracking-wider mb-3">Paketa & Vlera</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="label">Emri Paketës *</label>
                <input type="text" value={form.package_name} onChange={e => set('package_name', e.target.value)} className="input-field" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Çfarë përfshin paketa</label>
                <textarea value={form.package_notes} onChange={e => set('package_notes', e.target.value)} rows={4} className="input-field resize-none" />
              </div>
              <div>
                <label className="label">Shuma *</label>
                <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} className="input-field" />
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

          <div className="h-px bg-charcoal-100" />

          <div>
            <h3 className="text-xs font-semibold text-gold-600 uppercase tracking-wider mb-3">Datat</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label">Check-in</label>
                <input type="date" value={form.checkin_date} onChange={e => set('checkin_date', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">Check-out</label>
                <input type="date" value={form.checkout_date} onChange={e => set('checkout_date', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">Valid deri *</label>
                <input type="date" value={form.expires_at} onChange={e => set('expires_at', e.target.value)} className="input-field" />
              </div>
            </div>
          </div>

          <div className="h-px bg-charcoal-100" />

          <div>
            <h3 className="text-xs font-semibold text-gold-600 uppercase tracking-wider mb-3">Shënime Interne</h3>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} className="input-field resize-none" placeholder="Shënime interne..." />
          </div>

          {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-charcoal-100 sticky bottom-0 bg-white">
          <button onClick={onClose} className="btn-outline flex-1 justify-center">Anulo</button>
          <button onClick={handleSave} disabled={loading} className="btn-gold flex-1 justify-center">
            {loading ? 'Duke ruajtur...' : '✓ Ruaj Ndryshimet'}
          </button>
        </div>
      </div>
    </div>
  );
}