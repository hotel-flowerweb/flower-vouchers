import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { status } = await req.json();

  if (!['active', 'redeemed', 'cancelled'].includes(status)) {
    return NextResponse.json({ error: 'Status i pavlefshëm' }, { status: 400 });
  }

  const updateData: any = { status };
  if (status === 'redeemed') {
    updateData.redeemed_at = new Date().toISOString();
    updateData.redeemed_by = user.email;
  }

  const { data, error } = await supabase
    .from('vouchers')
    .update(updateData)
    .eq('code', params.code.toUpperCase())
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}