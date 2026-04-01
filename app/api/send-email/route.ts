import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { sendVoucherEmail } from '@/lib/sendEmail';
import type { Voucher } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { code } = await req.json();

  if (!code) {
    return NextResponse.json({ error: 'Voucher code required' }, { status: 400 });
  }

  const { data: voucher, error: fetchError } = await supabase
    .from('vouchers')
    .select('*')
    .eq('code', code)
    .maybeSingle<Voucher>();

  if (fetchError || !voucher) {
    return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
  }

  const result = await sendVoucherEmail(voucher);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
