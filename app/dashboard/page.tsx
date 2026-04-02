import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import DashboardTable from '@/components/DashboardTable';
import type { Profile } from '@/lib/supabase';
import { format, isToday } from 'date-fns';

export default async function DashboardPage({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single<Profile>();

  const q = searchParams.q?.trim() || '';
  let vouchersQuery = supabase
    .from('vouchers').select('*')
    .order('created_at', { ascending: false }).limit(100);

  if (q) {
    vouchersQuery = vouchersQuery.or(
      `code.ilike.%${q}%,customer_name.ilike.%${q}%,customer_email.ilike.%${q}%,phone.ilike.%${q}%`
    );
  }

  const { data: vouchers } = await vouchersQuery;
  const { data: allVouchersData } = await supabase.from('vouchers').select('status, redeemed_at');
  const allVouchers = allVouchersData || [];

  const stats = {
    total: allVouchers.length,
    active: allVouchers.filter((v: any) => v.status === 'active').length,
    redeemedToday: allVouchers.filter((v: any) => v.redeemed_at && isToday(new Date(v.redeemed_at))).length,
    expired: allVouchers.filter((v: any) => v.status === 'expired').length,
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar profile={profile} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl text-charcoal-900">Dashboard</h1>
            <p className="text-charcoal-500 text-sm mt-1">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
          </div>
          <Link href="/vouchers/new" className="btn-gold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Krijo Gift Card
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-6">
            <div className="text-3xl font-display font-bold text-charcoal-900">{stats.total}</div>
            <div className="text-charcoal-500 text-sm mt-1">Gjithsej</div>
            <div className="gold-line mt-3" />
          </div>
          <div className="card p-6">
            <div className="text-3xl font-display font-bold text-emerald-600">{stats.active}</div>
            <div className="text-charcoal-500 text-sm mt-1">Aktive</div>
            <div className="gold-line mt-3" />
          </div>
          <div className="card p-6">
            <div className="text-3xl font-display font-bold text-blue-600">{stats.redeemedToday}</div>
            <div className="text-charcoal-500 text-sm mt-1">Te perdorura sot</div>
            <div className="gold-line mt-3" />
          </div>
          <div className="card p-6">
            <div className="text-3xl font-display font-bold text-red-500">{stats.expired}</div>
            <div className="text-charcoal-500 text-sm mt-1">Skaduar</div>
            <div className="gold-line mt-3" />
          </div>
        </div>

        <div className="mb-6">
          <SearchBar defaultValue={q} />
        </div>

        <DashboardTable vouchers={vouchers || []} searchQuery={q} userEmail={user.email || ''} />
      </div>
    </div>
  );
}
