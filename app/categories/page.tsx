import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import Navbar from '@/components/Navbar';
import CategoriesManager from '@/components/CategoriesManager';
import type { Profile, GiftCategory } from '@/lib/supabase';

export default async function CategoriesPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single<Profile>();

  const { data: categories = [] } = await supabase
    .from('gift_categories').select('*').order('name');

  return (
    <div className="min-h-screen bg-cream">
      <Navbar profile={profile} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-charcoal-400 text-sm mb-3">
            <a href="/dashboard" className="hover:text-charcoal-600">Dashboard</a>
            <span>›</span>
            <span className="text-charcoal-700">Kategorite</span>
          </div>
          <h1 className="font-display text-3xl text-charcoal-900">Kategorite e Gift Card</h1>
          <p className="text-charcoal-500 text-sm mt-1">Krijo dhe menaxho paketat e disponueshme</p>
        </div>
        <CategoriesManager initialCategories={categories as GiftCategory[]} userEmail={user.email || ''} />
      </div>
    </div>
  );
}
