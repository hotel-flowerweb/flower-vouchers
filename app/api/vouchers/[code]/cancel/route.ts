import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const { code } = params;

  const { data: voucher } = await supabase
    .from('vouchers')
    .select('status')
    .eq('code', code.toUpperCase())
    .maybeSingle();

  if (!voucher) {
    return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
  }

  if (voucher.status === 'redeemed') {
    return NextResponse.json({ error: 'Cannot cancel a redeemed voucher' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('vouchers')
    .update({ status: 'cancelled' })
    .eq('code', code.toUpperCase())
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
