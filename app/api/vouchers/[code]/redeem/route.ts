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

  const { code } = params;

  // Fetch the voucher
  const { data: voucher, error: fetchError } = await supabase
    .from('vouchers')
    .select('*')
    .eq('code', code.toUpperCase())
    .maybeSingle();

  if (fetchError || !voucher) {
    return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
  }

  // Check validity
  if (voucher.status === 'redeemed') {
    return NextResponse.json({ error: 'Voucher has already been redeemed' }, { status: 400 });
  }
  if (voucher.status === 'cancelled') {
    return NextResponse.json({ error: 'Voucher has been cancelled' }, { status: 400 });
  }
  if (voucher.status === 'expired' || new Date(voucher.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Voucher has expired' }, { status: 400 });
  }

  // Redeem
  const { data, error } = await supabase
    .from('vouchers')
    .update({
      status: 'redeemed',
      redeemed_at: new Date().toISOString(),
      redeemed_by: user.email,
    })
    .eq('code', code.toUpperCase())
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
