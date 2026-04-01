import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function PUT(req: NextRequest, { params }: { params: { code: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const { data, error } = await supabase
    .from('vouchers')
    .update({
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      phone: body.phone || null,
      gifter_name: body.gifter_name || null,
      gifter_email: body.gifter_email || null,
      package_name: body.package_name,
      package_notes: body.package_notes || null,
      amount: parseFloat(body.amount),
      currency: body.currency,
      checkin_date: body.checkin_date || null,
      checkout_date: body.checkout_date || null,
      expires_at: new Date(body.expires_at + 'T23:59:59').toISOString(),
      notes: body.notes || null,
    })
    .eq('code', params.code.toUpperCase())
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}