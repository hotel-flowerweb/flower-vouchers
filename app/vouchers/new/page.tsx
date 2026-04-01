import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import Navbar from '@/components/Navbar';
import NewVoucherForm from '@/components/NewVoucherForm';
import type { Profile } from '@/lib/supabase';

export default async function NewVoucherPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  return (
    <div className="min-h-screen bg-cream">
      <Navbar profile={profile} />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-charcoal-400 text-sm mb-3">
            <a href="/dashboard" className="hover:text-charcoal-600 transition-colors">Dashboard</a>
            <span>›</span>
            <span className="text-charcoal-700">New Voucher</span>
          </div>
          <h1 className="font-display text-3xl text-charcoal-900">Create Gift Voucher</h1>
          <p className="text-charcoal-500 text-sm mt-1">Issue a new voucher for a guest</p>
        </div>
        <NewVoucherForm userEmail={user.email || ''} />
      </div>
    </div>
  );
}
