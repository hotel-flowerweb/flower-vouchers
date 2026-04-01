'use client';

import { useState } from 'react';
import type { Voucher } from '@/lib/supabase';
import { format } from 'date-fns';
import VoucherEditModal from './VoucherEditModal';

interface Props {
  voucher: Voucher;
}

export default function VoucherDetailClient({ voucher }: Props) {
  const [showEdit, setShowEdit] = useState(false);

  return (
    <>
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-charcoal-800">Të dhënat</h2>
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold-50 border border-gold-200 text-gold-700 text-sm font-medium hover:bg-gold-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Ndrysho
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Marrësi', value: voucher.customer_name },
            { label: 'Email', value: voucher.customer_email },
            { label: 'Telefon', value: voucher.phone || '—' },
            { label: 'Dhuruesit', value: voucher.gifter_name || '—' },
            { label: 'Paketa', value: voucher.package_name },
            { label: 'Shuma', value: `${voucher.currency} ${Number(voucher.amount).toFixed(2)}` },
            { label: 'Check-in', value: voucher.checkin_date ? format(new Date(voucher.checkin_date), 'dd MMM yyyy') : '—' },
            { label: 'Check-out', value: voucher.checkout_date ? format(new Date(voucher.checkout_date), 'dd MMM yyyy') : '—' },
            { label: 'Lëshuar', value: format(new Date(voucher.issued_at), 'dd MMM yyyy') },
            { label: 'Valid deri', value: format(new Date(voucher.expires_at), 'dd MMM yyyy') },
            { label: 'Krijuar nga', value: voucher.created_by },
            { label: 'Valuta', value: voucher.currency },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-charcoal-800 text-sm font-medium">{value}</p>
            </div>
          ))}
        </div>

        {voucher.package_notes && (
          <div className="mt-4 pt-4 border-t border-charcoal-100">
            <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-2">Paketa përfshin</p>
            <ul className="space-y-1">
              {voucher.package_notes.split('\n').filter(l => l.trim()).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-charcoal-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0 mt-1.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showEdit && <VoucherEditModal voucher={voucher} onClose={() => setShowEdit(false)} />}
    </>
  );
}