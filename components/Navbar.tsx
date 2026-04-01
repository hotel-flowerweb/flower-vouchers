'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { Profile } from '@/lib/supabase';

interface NavbarProps {
  profile: Profile | null;
}

const HOTEL_NAME = process.env.NEXT_PUBLIC_HOTEL_NAME || 'Flower Hotel & Resort';

export default function Navbar({ profile }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { href: '/vouchers/new', label: 'New Voucher', icon: '+' },
    { href: '/categories', label: 'Kategorite', icon: '◈' },
  ];

  return (
    <nav className="bg-charcoal-900 border-b border-charcoal-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold">
                <span className="font-display text-base font-bold text-white">F</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-white font-display text-sm tracking-wide">{HOTEL_NAME}</div>
                <div className="text-charcoal-500 text-[10px] tracking-[2px] uppercase">Vouchers</div>
              </div>
            </div>

            {/* Nav links */}
            <div className="flex items-center gap-1 ml-4">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${pathname === link.href
                      ? 'bg-white/10 text-white'
                      : 'text-charcoal-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <span className="text-gold-500 text-xs">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {profile && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-charcoal-700 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {(profile.full_name || profile.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-white text-xs font-medium">
                    {profile.full_name || profile.email.split('@')[0]}
                  </div>
                  <div className="text-gold-500 text-[10px] uppercase tracking-wider">
                    {profile.role}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-charcoal-400 hover:text-white hover:bg-white/5
                         text-sm transition-all duration-200 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
