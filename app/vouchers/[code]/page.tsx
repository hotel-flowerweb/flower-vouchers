import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import Navbar from '@/components/Navbar';
import VoucherActions from '@/components/VoucherActions';
import VoucherCard from '@/components/VoucherCard';
import VoucherDetailClient from '@/components/VoucherDetailClient';
import type { Voucher, Profile } from '@/lib/supabase';
import { format } from 'date-fns';

export default async function VoucherDetailPage({ params }: { params: { code: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single<Profile>();

  const { data: voucher, error } = await supabase
    .from('vouchers').select('*').eq('code', params.code.toUpperCase()).maybeSingle<Voucher>();

  if (error || !voucher) notFound();

  const isExpired = new Date(voucher.expires_at) < new Date();
  const statusLabel = isExpired && voucher.status === 'active' ? 'expired' : voucher.status;

  const badges: Record<string, string> = {
    active: 'badge-active', redeemed: 'badge-redeemed',
    cancelled: 'badge-cancelled', expired: 'badge-expired',
  };
  const dots: Record<string, string> = {
    active: 'bg-emerald-500', redeemed: 'bg-blue-500',
    cancelled: 'bg-charcoal-400', expired: 'bg-red-500',
  };

  const v = JSON.parse(JSON.stringify(voucher));

  return (
    <div className="min-h-screen bg-cream">
      <Navbar profile={profile} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-2 text-charcoal-400 text-sm mb-6">
          <a href="/dashboard" className="hover:text-charcoal-600 transition-colors">Dashboard</a>
          <span>›</span>
          <span className="font-mono text-charcoal-700">{v.code}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-charcoal-400 text-xs uppercase tracking-widest mb-1">Voucher Code</p>
                  <h1 className="font-mono text-2xl font-bold text-gold-600 tracking-widest">{v.code}</h1>
                </div>
                <span className={badges[statusLabel]}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dots[statusLabel]}`} />
                  {statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-charcoal-100">
                <div className="text-4xl font-display font-bold text-charcoal-900">
                  {v.currency} {Number(v.amount).toFixed(2)}
                </div>
                <div className="text-charcoal-500 mt-1">{v.package_name}</div>
              </div>
            </div>

            <VoucherDetailClient voucher={v} />

            {v.status === 'redeemed' && (
              <div className="card p-6 border-l-4 border-blue-400">
                <h2 className="font-semibold text-charcoal-800 mb-3">Detajet e Përdorimit</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-1">Përdorur më</p>
                    <p className="text-charcoal-800 text-sm">
                      {v.redeemed_at ? format(new Date(v.redeemed_at), 'dd MMM yyyy, HH:mm') : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-1">Nga</p>
                    <p className="text-charcoal-800 text-sm">{v.redeemed_by || '—'}</p>
                  </div>
                </div>
              </div>
            )}

            {v.notes && (
              <div className="card p-6">
                <h2 className="font-semibold text-charcoal-800 mb-2">Shënime Interne</h2>
                <p className="text-charcoal-600 text-sm">{v.notes}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <VoucherActions voucher={v} isAdmin={profile?.role === 'admin'} isExpired={isExpired} />
            <div className="card p-4">
              <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">Preview</p>
              <VoucherCard voucher={v} compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}