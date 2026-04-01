import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export type Voucher = {
  id: string;
  code: string;
  customer_name: string;
  customer_email: string;
  phone: string | null;
  gifter_name: string | null;
  gifter_email: string | null;
  checkin_date: string | null;
  checkout_date: string | null;
  package_name: string;
  package_notes: string | null;
  amount: number;
  currency: string;
  issued_at: string;
  expires_at: string;
  status: 'active' | 'redeemed' | 'cancelled' | 'expired';
  redeemed_at: string | null;
  redeemed_by: string | null;
  notes: string | null;
  category_id: string | null;
  image_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type GiftCategory = {
  id: string;
  name: string;
  description: string | null;
  elements: string[] | null;
  image_url: string | null;
  base_price: number | null;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'reception';
  created_at: string;
};
