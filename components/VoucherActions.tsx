'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Voucher } from '@/lib/supabase';
import { format } from 'date-fns';

interface Props {
  voucher: Voucher;
  isAdmin: boolean;
  isExpired: boolean;
}

const HOTEL_NAME = process.env.NEXT_PUBLIC_HOTEL_NAME || 'Flower Hotel & Resort';

export default function VoucherActions({ voucher, isAdmin, isExpired }: Props) {
  const router = useRouter();
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const isActionable = voucher.status === 'active' && !isExpired;

  const showMsg = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleRedeem = async () => {
    if (!confirm(`Redeem voucher ${voucher.code} for ${voucher.customer_name}?`)) return;
    setRedeemLoading(true);

    const res = await fetch(`/api/vouchers/${voucher.code}/redeem`, { method: 'POST' });
    const json = await res.json();

    if (!res.ok) {
      showMsg(json.error || 'Failed to redeem.', 'error');
    } else {
      showMsg('Voucher redeemed successfully!');
      router.refresh();
    }
    setRedeemLoading(false);
  };

  const handleCancel = async () => {
    if (!confirm(`Cancel voucher ${voucher.code}? This cannot be undone.`)) return;
    setCancelLoading(true);

    const res = await fetch(`/api/vouchers/${voucher.code}/cancel`, { method: 'POST' });
    const json = await res.json();

    if (!res.ok) {
      showMsg(json.error || 'Failed to cancel.', 'error');
    } else {
      showMsg('Voucher cancelled.');
      router.refresh();
    }
    setCancelLoading(false);
  };

  const handleEmail = async () => {
    setEmailLoading(true);

    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: voucher.code }),
    });
    const json = await res.json();

    if (!res.ok) {
      showMsg(json.error || 'Failed to send email.', 'error');
    } else {
      showMsg(`Email sent to ${voucher.customer_email}`);
    }
    setEmailLoading(false);
  };

  const handleWhatsApp = () => {
    const expiry = format(new Date(voucher.expires_at), 'dd MMM yyyy');
    const text = encodeURIComponent(
      `Hello ${voucher.customer_name},\n\nHere is your voucher from ${HOTEL_NAME}.\n\n` +
      `Code: ${voucher.code}\n` +
      `Package: ${voucher.package_name}\n` +
      `Value: ${voucher.currency} ${Number(voucher.amount).toFixed(2)}\n` +
      `Expires: ${expiry}\n\n` +
      `Thank you for choosing ${HOTEL_NAME}! 🌸`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.open(`/vouchers/${voucher.code}/print`, '_blank');
  };

  return (
    <div className="card p-6 space-y-4">
      <h2 className="font-semibold text-charcoal-800">Actions</h2>

      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
          messageType === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-2.5">
        {/* Redeem */}
        <button
          onClick={handleRedeem}
          disabled={!isActionable || redeemLoading}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold
            transition-all duration-200 ${isActionable
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-[0.98]'
              : 'bg-charcoal-100 text-charcoal-400 cursor-not-allowed'
            }`}
        >
          {redeemLoading ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {redeemLoading ? 'Redeeming...' : 'Mark as Redeemed'}
        </button>

        {/* Send email */}
        <button
          onClick={handleEmail}
          disabled={emailLoading}
          className="w-full btn-gold justify-center"
        >
          {emailLoading ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )}
          {emailLoading ? 'Sending...' : 'Send to Client'}
        </button>

        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold
            bg-[#25D366] hover:bg-[#1ebe59] text-white transition-all duration-200 active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Share via WhatsApp
        </button>

        {/* Print */}
        <button
          onClick={handlePrint}
          className="btn-outline w-full justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Voucher
        </button>

        {/* Cancel — admin only */}
        {isAdmin && voucher.status !== 'redeemed' && voucher.status !== 'cancelled' && (
          <>
            <div className="h-px bg-charcoal-100" />
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="btn-danger w-full justify-center"
            >
              {cancelLoading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              Cancel Voucher
            </button>
          </>
        )}
      </div>
    </div>
  );
}
