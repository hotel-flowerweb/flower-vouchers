import { Resend } from 'resend';
import { Voucher } from './supabase';
import { format } from 'date-fns';

const resend = new Resend(process.env.RESEND_API_KEY);

const HOTEL_NAME = process.env.NEXT_PUBLIC_HOTEL_NAME || 'Flower Hotel & Resort';
const HOTEL_EMAIL = process.env.NEXT_PUBLIC_HOTEL_EMAIL || 'info@flowerhotel.al';
const HOTEL_PHONE = process.env.NEXT_PUBLIC_HOTEL_PHONE || '+355 69 123 4567';
const HOTEL_ADDRESS = process.env.NEXT_PUBLIC_HOTEL_ADDRESS || 'Golem, Kavajë, Albania';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendVoucherEmail(voucher: Voucher): Promise<{ success: boolean; error?: string }> {
  const expiryFormatted = format(new Date(voucher.expires_at), 'dd MMMM yyyy');
  const issuedFormatted = format(new Date(voucher.issued_at), 'dd MMMM yyyy');
  const voucherUrl = `${APP_URL}/vouchers/${voucher.code}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Gift Voucher — ${HOTEL_NAME}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, serif; background: #f5f3ef; color: #2C2C2C; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; padding: 40px 0 32px; }
    .logo-circle {
      width: 72px; height: 72px; border-radius: 50%;
      background: linear-gradient(135deg, #C9A84C, #e4c06e);
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 16px; font-size: 32px; color: white; font-weight: bold;
    }
    .hotel-name { font-size: 26px; color: #C9A84C; letter-spacing: 3px; text-transform: uppercase; }
    .subtitle { font-size: 13px; color: #7c7772; letter-spacing: 2px; margin-top: 4px; }
    .card {
      background: white; border-radius: 16px; overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.08);
      border-top: 4px solid #C9A84C;
    }
    .card-header { background: linear-gradient(135deg, #2C2C2C 0%, #4a4441 100%); padding: 32px; text-align: center; }
    .voucher-label { font-size: 11px; color: #C9A84C; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 12px; }
    .code {
      font-family: 'Courier New', monospace; font-size: 28px; font-weight: bold;
      color: #C9A84C; letter-spacing: 4px; padding: 12px 24px;
      border: 2px solid rgba(201, 168, 76, 0.4); border-radius: 8px;
      display: inline-block; margin: 8px 0;
    }
    .amount { font-size: 40px; color: white; margin-top: 16px; }
    .currency { font-size: 20px; vertical-align: super; margin-right: 4px; }
    .package { font-size: 14px; color: rgba(255,255,255,0.6); margin-top: 8px; letter-spacing: 1px; }
    .card-body { padding: 32px; }
    .greeting { font-size: 18px; color: #2C2C2C; margin-bottom: 16px; }
    .message { font-size: 14px; color: #5C5552; line-height: 1.7; margin-bottom: 24px; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .detail-item { background: #fafaf8; border-radius: 8px; padding: 14px 16px; }
    .detail-label { font-size: 10px; color: #7c7772; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
    .detail-value { font-size: 14px; color: #2C2C2C; font-weight: 600; }
    .cta {
      display: block; text-align: center; background: linear-gradient(135deg, #C9A84C, #b8891a);
      color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px;
      font-size: 14px; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;
      margin: 24px 0;
    }
    .divider { border: none; border-top: 1px solid #edecea; margin: 24px 0; }
    .terms { font-size: 12px; color: #97928d; line-height: 1.6; }
    .footer { text-align: center; padding: 32px 0 0; }
    .footer-hotel { font-size: 14px; color: #5C5552; }
    .footer-contact { font-size: 12px; color: #7c7772; margin-top: 8px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div style="font-size:32px; margin-bottom:12px;">✦</div>
      <div class="hotel-name">${HOTEL_NAME}</div>
      <div class="subtitle">Gift Voucher</div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="voucher-label">Gift Voucher</div>
        <div class="code">${voucher.code}</div>
        <div class="amount"><span class="currency">${voucher.currency}</span>${Number(voucher.amount).toFixed(2)}</div>
        <div class="package">${voucher.package_name}</div>
      </div>
      <div class="card-body">
        <div class="greeting">Dear ${voucher.customer_name},</div>
        <div class="message">
          We are delighted to present you with this gift voucher for ${HOTEL_NAME}.
          This voucher entitles you to a wonderful experience with us. We look forward to welcoming you.
        </div>

        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-label">Package</div>
            <div class="detail-value">${voucher.package_name}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Value</div>
            <div class="detail-value">${voucher.currency} ${Number(voucher.amount).toFixed(2)}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Issued</div>
            <div class="detail-value">${issuedFormatted}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Valid Until</div>
            <div class="detail-value">${expiryFormatted}</div>
          </div>
        </div>

        <a href="${voucherUrl}" class="cta">View Voucher Details</a>

        <hr class="divider" />
        <div class="terms">
          <strong>Terms &amp; Conditions:</strong><br/>
          • This voucher is non-refundable and non-transferable.<br/>
          • Valid until ${expiryFormatted}. Expired vouchers cannot be used.<br/>
          • Voucher code must be presented at reception upon arrival.<br/>
          • Cannot be combined with other promotions unless stated.<br/>
          • ${HOTEL_NAME} reserves the right to amend these terms.
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-hotel">${HOTEL_NAME}</div>
      <div class="footer-contact">
        ${HOTEL_ADDRESS}<br/>
        ${HOTEL_PHONE} · ${HOTEL_EMAIL}
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const { error } = await resend.emails.send({
      from: `${HOTEL_NAME} <${HOTEL_EMAIL}>`,
      to: [voucher.customer_email],
      subject: `Your Gift Voucher — ${voucher.code} | ${HOTEL_NAME}`,
      html,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send email';
    return { success: false, error: msg };
  }
}
