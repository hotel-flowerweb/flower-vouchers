import type { Voucher } from '@/lib/supabase';
import { format } from 'date-fns';

interface Props {
  voucher: Voucher;
  compact?: boolean;
}

const HOTEL_NAME = process.env.NEXT_PUBLIC_HOTEL_NAME || 'Flower Hotel & Resort';
const HOTEL_EMAIL = process.env.NEXT_PUBLIC_HOTEL_EMAIL || 'info@flowerhotel.al';
const HOTEL_PHONE = process.env.NEXT_PUBLIC_HOTEL_PHONE || '+355 69 123 4567';
const HOTEL_ADDRESS = process.env.NEXT_PUBLIC_HOTEL_ADDRESS || 'Golem, Kavajë, Albania';

export default function VoucherCard({ voucher, compact = false }: Props) {
  const expiryFormatted = format(new Date(voucher.expires_at), 'dd MMMM yyyy');
  const issuedFormatted = format(new Date(voucher.issued_at), 'dd MMM yyyy');

  if (compact) {
    return (
      <div className="rounded-xl overflow-hidden" style={{
        background: 'linear-gradient(135deg, #2C2C2C 0%, #3d3836 50%, #2C2C2C 100%)',
        fontFamily: 'Georgia, serif',
      }}>
        {/* Gold top bar */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #C9A84C, #e4c06e, #C9A84C)' }} />

        <div className="p-5 text-center">
          {/* Ornament */}
          <div style={{ color: '#C9A84C', fontSize: '18px', marginBottom: '6px' }}>✦</div>
          <div style={{ color: '#C9A84C', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>
            {HOTEL_NAME}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Gift Voucher
          </div>

          {/* Code */}
          <div style={{
            fontFamily: 'Courier New, monospace',
            color: '#C9A84C',
            fontSize: '15px',
            fontWeight: 'bold',
            letterSpacing: '3px',
            padding: '8px 16px',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: '6px',
            margin: '12px auto',
            display: 'inline-block',
          }}>
            {voucher.code}
          </div>

          {/* Amount */}
          <div style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', lineHeight: 1 }}>
            <span style={{ fontSize: '14px', verticalAlign: 'super', color: '#C9A84C' }}>{voucher.currency}</span>
            {Number(voucher.amount).toFixed(2)}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginTop: '4px' }}>
            {voucher.package_name}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '12px 0' }} />

          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>
            Valid until {expiryFormatted}
          </div>
        </div>
      </div>
    );
  }

  // Full print version
  return (
    <div id="voucher-print" style={{
      width: '794px',
      minHeight: '520px',
      background: 'white',
      fontFamily: 'Georgia, serif',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    }}>
      {/* Left panel - dark */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: '300px',
        background: 'linear-gradient(160deg, #2C2C2C 0%, #3d3836 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        textAlign: 'center',
      }}>
        {/* Decorative ring */}
        <div style={{
          width: '100px', height: '100px',
          border: '1.5px solid rgba(201,168,76,0.4)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px',
        }}>
          <div style={{
            width: '82px', height: '82px',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#C9A84C', fontSize: '36px', fontWeight: 'bold' }}>F</span>
          </div>
        </div>

        <div style={{ color: '#C9A84C', fontSize: '14px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '4px' }}>
          {HOTEL_NAME.split('&')[0].trim()}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '24px' }}>
          & Resort
        </div>

        <div style={{ width: '40px', height: '1px', background: 'rgba(201,168,76,0.4)', margin: '0 auto 24px' }} />

        <div style={{ color: '#C9A84C', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>
          Gift Voucher
        </div>

        {/* Amount */}
        <div style={{ color: 'white', fontSize: '42px', fontWeight: 'bold', lineHeight: 1 }}>
          <span style={{ fontSize: '18px', verticalAlign: 'super', color: '#C9A84C', marginRight: '2px' }}>
            {voucher.currency}
          </span>
          {Number(voucher.amount).toFixed(2)}
        </div>

        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '8px' }}>
          {voucher.package_name}
        </div>
      </div>

      {/* Dashed separator */}
      <div style={{
        position: 'absolute',
        left: '300px',
        top: '40px', bottom: '40px',
        width: '1px',
        borderLeft: '2px dashed rgba(201,168,76,0.3)',
      }} />

      {/* Right panel */}
      <div style={{
        marginLeft: '316px',
        padding: '40px 36px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '520px',
      }}>
        {/* Code */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '9px', color: '#7c7772', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Voucher Code
          </div>
          <div style={{
            fontFamily: 'Courier New, monospace',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#C9A84C',
            letterSpacing: '4px',
            padding: '10px 20px',
            border: '1.5px solid rgba(201,168,76,0.35)',
            borderRadius: '8px',
            display: 'inline-block',
          }}>
            {voucher.code}
          </div>
        </div>

        {/* Customer */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '9px', color: '#7c7772', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>
            Prepared For
          </div>
          <div style={{ fontSize: '20px', color: '#2C2C2C', fontWeight: 'bold' }}>
            {voucher.customer_name}
          </div>
          <div style={{ fontSize: '12px', color: '#7c7772', marginTop: '2px' }}>
            {voucher.customer_email}
          </div>
        </div>

        {/* Details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Package', value: voucher.package_name },
            { label: 'Issued', value: issuedFormatted },
            { label: 'Valid Until', value: expiryFormatted },
            { label: 'Value', value: `${voucher.currency} ${Number(voucher.amount).toFixed(2)}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#fafaf8', borderRadius: '8px', padding: '10px 12px' }}>
              <div style={{ fontSize: '9px', color: '#7c7772', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '3px' }}>
                {label}
              </div>
              <div style={{ fontSize: '13px', color: '#2C2C2C', fontWeight: '600' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Terms */}
        <div style={{
          borderTop: '1px solid #edecea',
          paddingTop: '16px',
          marginTop: 'auto',
        }}>
          <div style={{ fontSize: '9px', color: '#7c7772', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
            Terms & Conditions
          </div>
          <div style={{ fontSize: '10px', color: '#97928d', lineHeight: '1.6' }}>
            Non-refundable • Non-transferable • Valid until {expiryFormatted} •
            Present this voucher at reception upon arrival •
            Cannot be combined with other offers unless stated
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid #edecea',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}>
          <div style={{ fontSize: '10px', color: '#97928d' }}>
            {HOTEL_ADDRESS}<br />
            {HOTEL_PHONE} · {HOTEL_EMAIL}
          </div>
          <div style={{
            fontSize: '9px',
            color: '#C9A84C',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}>
            {HOTEL_NAME}
          </div>
        </div>
      </div>
    </div>
  );
}
