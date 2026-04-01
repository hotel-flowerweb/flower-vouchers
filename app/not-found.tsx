import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="text-center">
        <div className="font-display text-8xl text-charcoal-200 mb-4">404</div>
        <h1 className="font-display text-2xl text-charcoal-800 mb-2">Page Not Found</h1>
        <p className="text-charcoal-500 mb-6">The voucher or page you're looking for doesn't exist.</p>
        <Link href="/dashboard" className="btn-gold">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
