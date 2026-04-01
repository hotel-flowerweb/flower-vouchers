import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { Voucher } from '@/lib/supabase';
import { format } from 'date-fns';
import path from 'path';
import fs from 'fs';

const HOTEL_NAME = process.env.NEXT_PUBLIC_HOTEL_NAME || 'Flower Hotel & Resort';
const HOTEL_EMAIL = process.env.NEXT_PUBLIC_HOTEL_EMAIL || 'receptionflower@gmail.com';
const HOTEL_PHONE = process.env.NEXT_PUBLIC_HOTEL_PHONE || '+355676040707';
const HOTEL_ADDRESS = process.env.NEXT_PUBLIC_HOTEL_ADDRESS || 'Golem, Kavajë, Albania';

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: voucher, error } = await supabase
    .from('vouchers').select('*').eq('code', params.code.toUpperCase()).maybeSingle<Voucher>();

  if (error || !voucher) {
    return new NextResponse('Not found', { status: 404 });
  }

  const expiryFormatted = format(new Date(voucher.expires_at), 'dd MMMM yyyy');
  const issuedFormatted = format(new Date(voucher.issued_at), 'dd MMMM yyyy');
  const checkinFormatted = voucher.checkin_date ? format(new Date(voucher.checkin_date), 'dd MMM yyyy') : null;
  const checkoutFormatted = voucher.checkout_date ? format(new Date(voucher.checkout_date), 'dd MMM yyyy') : null;
  const packageItems = voucher.package_notes ? voucher.package_notes.split('\n').filter((l: string) => l.trim()) : [];

  let logoBase64 = '';
  try {
    const logoPath = path.join(process.cwd(), 'public', 'flower-logo.jpg');
    logoBase64 = `data:image/jpeg;base64,${fs.readFileSync(logoPath).toString('base64')}`;
  } catch {}

  const html = `<!DOCTYPE html>
<html lang="sq">
<head>
<meta charset="UTF-8">
<title>Gift Card ${voucher.code}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Georgia, serif; background: #f0ece4; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 32px 16px; color: #2C2C2C; }
.toolbar { display: flex; gap: 12px; margin-bottom: 28px; justify-content: center; }
.btn { padding: 11px 28px; border-radius: 8px; font-size: 14px; cursor: pointer; border: none; font-weight: 600; font-family: Arial, sans-serif; }
.btn-gold { background: linear-gradient(135deg, #C9A84C, #b8891a); color: white; }
.btn-outline { background: white; color: #5C5552; border: 1px solid #d8d5d3; }
.voucher { width: 720px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.12); }
.gold-strip { height: 4px; background: linear-gradient(90deg, #8B6914, #C9A84C, #e4c06e, #C9A84C, #8B6914); }
.top-section { padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid #f0ece4; }
.logo { height: 90px; width: auto; object-fit: contain; }
.hotel-tagline { font-size: 10px; color: #97928d; letter-spacing: 3px; text-transform: uppercase; margin-top: 8px; font-family: Arial, sans-serif; }
.image-overlay { position: relative; }
.package-image { width: 100%; height: 260px; object-fit: cover; display: block; }
.package-image-placeholder { width: 100%; height: 260px; background: linear-gradient(135deg, #2C2C2C, #3d3836); }
.image-label { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.65), transparent); padding: 32px 40px 20px; }
.image-label-tag { font-size: 9px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; color: #C9A84C; margin-bottom: 4px; }
.image-label-title { font-size: 26px; font-weight: 600; color: white; }
.gifter-band { background: linear-gradient(135deg, #1a1a1a, #2C2C2C); padding: 14px 40px; display: flex; align-items: center; justify-content: space-between; }
.gifter-text { font-size: 12px; color: rgba(255,255,255,0.6); font-style: italic; font-family: Arial, sans-serif; }
.gifter-name { color: white; font-weight: 600; }
.code-pill { font-family: monospace; font-size: 13px; font-weight: bold; color: #C9A84C; letter-spacing: 3px; padding: 5px 14px; border: 1px solid rgba(201,168,76,0.35); border-radius: 20px; }
.body { padding: 32px 40px; }
.to-section { margin-bottom: 24px; }
.to-label { font-size: 9px; color: #97928d; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 6px; font-family: Arial, sans-serif; }
.to-name { font-size: 22px; color: #2C2C2C; font-weight: 600; }
.to-email { font-size: 12px; color: #7c7772; margin-top: 2px; font-family: Arial, sans-serif; }
.dates-row { display: flex; gap: 12px; margin-bottom: 24px; }
.date-box { flex: 1; background: #fafaf8; border-radius: 10px; padding: 12px 14px; border: 1px solid #edecea; }
.date-box-label { font-size: 9px; color: #97928d; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; font-family: Arial, sans-serif; }
.date-box-value { font-size: 13px; color: #2C2C2C; font-weight: 500; font-family: Arial, sans-serif; }
.includes-title { font-size: 9px; font-weight: 600; color: #C9A84C; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid rgba(201,168,76,0.2); font-family: Arial, sans-serif; }
.includes-list { margin-bottom: 24px; }
.includes-item { display: flex; align-items: flex-start; gap: 10px; padding: 7px 0; border-bottom: 1px solid #f5f3ef; font-size: 13px; color: #3d3836; font-family: Arial, sans-serif; }
.includes-item:last-child { border-bottom: none; }
.includes-dot { width: 6px; height: 6px; border-radius: 50%; background: #C9A84C; flex-shrink: 0; margin-top: 4px; }
.valid-box { background: linear-gradient(135deg,#fdf9ed,#fffdf5); border: 1px solid rgba(201,168,76,0.25); border-radius: 12px; padding: 18px 22px; margin-bottom: 24px; }
.valid-label { font-size: 10px; color: #7c7772; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; font-family: Arial, sans-serif; }
.valid-date { font-size: 24px; color: #C9A84C; font-weight: 700; }
.terms { font-size: 10px; color: #bab6b2; line-height: 1.7; padding-top: 16px; border-top: 1px solid #edecea; font-family: Arial, sans-serif; }
.footer { background: #fafaf8; border-top: 1px solid #edecea; padding: 16px 40px; display: flex; justify-content: space-between; align-items: center; }
.footer-contact { font-size: 10px; color: #97928d; line-height: 1.7; font-family: Arial, sans-serif; }
.footer-brand { font-size: 11px; color: #C9A84C; letter-spacing: 2px; }
@media print { .toolbar { display: none !important; } body { background: white; padding: 0; } .voucher { box-shadow: none; border-radius: 0; width: 100%; } }
@page { size: A4 portrait; margin: 1.2cm; }
</style>
</head>
<body>
<div class="toolbar">
  <button class="btn btn-gold" onclick="window.print()">Printo / Shkarko PDF</button>
  <button class="btn btn-outline" onclick="window.close()">Mbyll</button>
</div>
<div class="voucher">
  <div class="gold-strip"></div>
  <div class="top-section">
    ${logoBase64 ? `<img src="${logoBase64}" alt="Flower Hotel" class="logo">` : '<div style="font-size:36px;color:#C9A84C;">F</div>'}
    <div class="hotel-tagline">${HOTEL_NAME}</div>
  </div>
  <div class="image-overlay">
    ${voucher.image_url ? `<img src="${voucher.image_url}" alt="" class="package-image">` : '<div class="package-image-placeholder"></div>'}
    <div class="image-label">
      <div class="image-label-tag">Gift Card</div>
      <div class="image-label-title">${voucher.package_name}</div>
    </div>
  </div>
  <div class="gifter-band">
    <div class="gifter-text">${voucher.gifter_name ? `Dhurate nga <span class="gifter-name">${voucher.gifter_name}</span>` : HOTEL_NAME}</div>
    <div class="code-pill">${voucher.code}</div>
  </div>
  <div class="body">
    <div class="to-section">
      <div class="to-label">Per</div>
      <div class="to-name">${voucher.customer_name}</div>
      <div class="to-email">${voucher.customer_email}</div>
    </div>
    <div class="dates-row">
      ${checkinFormatted ? `<div class="date-box"><div class="date-box-label">Check-in</div><div class="date-box-value">${checkinFormatted}</div></div>` : ''}
      ${checkoutFormatted ? `<div class="date-box"><div class="date-box-label">Check-out</div><div class="date-box-value">${checkoutFormatted}</div></div>` : ''}
      <div class="date-box"><div class="date-box-label">Leshuar</div><div class="date-box-value">${issuedFormatted}</div></div>
    </div>
    ${packageItems.length > 0 ? `<div class="includes-title">Paketa perfshin</div><div class="includes-list">${packageItems.map((item: string) => `<div class="includes-item"><div class="includes-dot"></div><span>${item}</span></div>`).join('')}</div>` : ''}
    <div class="valid-box">
      <div class="valid-label">Valid deri</div>
      <div class="valid-date">${expiryFormatted}</div>
    </div>
    <div class="terms">Jo e rimbursueshme - Jo e transferueshme - Prezantoni kete karte ne recepsion - ${HOTEL_NAME}</div>
  </div>
  <div class="footer">
    <div class="footer-contact">${HOTEL_ADDRESS} - ${HOTEL_PHONE}<br>${HOTEL_EMAIL}</div>
    <div class="footer-brand">${HOTEL_NAME}</div>
  </div>
  <div class="gold-strip"></div>
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
```
