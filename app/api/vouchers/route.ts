
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { generateUniqueCode } from '@/lib/generateCode';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const HOTEL_NAME = process.env.NEXT_PUBLIC_HOTEL_NAME || 'Flower Hotel & Resort';
const RECEPTION_EMAIL = process.env.NEXT_PUBLIC_HOTEL_EMAIL || 'receptionflower@gmail.com';

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    customer_name, customer_email, phone,
    gifter_name, gifter_email,
    package_name, package_notes, category_id,
    amount, currency = 'EUR',
    checkin_date, checkout_date,
    expires_at, notes, created_by,
  } = body;

  if (!customer_name || !customer_email || !package_name || !amount || !expires_at) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const code = await generateUniqueCode(async (c: string) => {
    const { data } = await supabase.from('vouchers').select('id').eq('code', c).maybeSingle();
    return !!data;
  });

  let image_url = null;
  if (category_id) {
    const { data: cat } = await supabase.from('gift_categories').select('image_url').eq('id', category_id).single();
    if (cat?.image_url) image_url = cat.image_url;
  }

  const { data, error } = await supabase.from('vouchers').insert({
    code,
    customer_name, customer_email,
    phone: phone || null,
    gifter_name: gifter_name || null,
    gifter_email: gifter_email || null,
    package_name,
    package_notes: package_notes || null,
    category_id: category_id || null,
    image_url,
    amount: parseFloat(amount),
    currency,
    checkin_date: checkin_date || null,
    checkout_date: checkout_date || null,
    issued_at: new Date().toISOString(),
    expires_at: new Date(expires_at + 'T23:59:59').toISOString(),
    status: 'active',
    notes: notes || null,
    created_by: created_by || user.email,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [RECEPTION_EMAIL],
      subject: `Gift Card e re: ${code} — ${customer_name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #C9A84C;">Gift Card e Re u Krijua</h2>
          <p style="color: #5C5552;">Një gift card e re është lëshuar nga sistemi.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr><td style="padding: 8px 0; color: #7c7772; font-size: 12px;">KODI</td><td style="padding: 8px 0; font-weight: bold; color: #C9A84C; font-family: monospace;">${code}</td></tr>
            <tr><td style="padding: 8px 0; color: #7c7772; font-size: 12px;">MARRËSI</td><td style="padding: 8px 0;">${customer_name}</td></tr>
            <tr><td style="padding: 8px 0; color: #7c7772; font-size: 12px;">EMAIL</td><td style="padding: 8px 0;">${customer_email}</td></tr>
            ${gifter_name ? `<tr><td style="padding: 8px 0; color: #7c7772; font-size: 12px;">DHURUESIT</td><td style="padding: 8px 0;">${gifter_name}</td></tr>` : ''}
            <tr><td style="padding: 8px 0; color: #7c7772; font-size: 12px;">PAKETA</td><td style="padding: 8px 0;">${package_name}</td></tr>
            <tr><td style="padding: 8px 0; color: #7c7772; font-size: 12px;">SHUMA</td><td style="padding: 8px 0; font-weight: bold;">${currency} ${parseFloat(amount).toFixed(2)}</td></tr>
            ${checkin_date ? `<tr><td style="padding: 8px 0; color: #7c7772; font-size: 12px;">CHECK-IN</td><td style="padding: 8px 0;">${checkin_date}</td></tr>` : ''}
            ${checkout_date ? `<tr><td style="padding: 8px 0; color: #7c7772; font-size: 12px;">CHECK-OUT</td><td style="padding: 8px 0;">${checkout_date}</td></tr>` : ''}
            <tr><td style="padding: 8px 0; color: #7c7772; font-size: 12px;">VALID DERI</td><td style="padding: 8px 0;">${expires_at}</td></tr>
            <tr><td style="padding: 8px 0; color: #7c7772; font-size: 12px;">KRIJUAR NGA</td><td style="padding: 8px 0;">${created_by || user.email}</td></tr>
          </table>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #edecea; font-size: 11px; color: #97928d;">
            ${HOTEL_NAME}
          </div>
        </div>
      `,
    });
  } catch (e) {
    console.error('Email notification failed:', e);
  }

  return NextResponse.json(data, { status: 201 });
}