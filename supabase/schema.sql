-- ============================================================
-- Flower Hotel Voucher Management System — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'reception' CHECK (role IN ('admin', 'reception')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'reception')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- VOUCHERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vouchers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT UNIQUE NOT NULL,
  customer_name   TEXT NOT NULL,
  customer_email  TEXT NOT NULL,
  phone           TEXT,
  package_name    TEXT NOT NULL,
  amount          NUMERIC(10, 2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'EUR',
  issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'redeemed', 'cancelled', 'expired')),
  redeemed_at     TIMESTAMPTZ,
  redeemed_by     TEXT,
  notes           TEXT,
  created_by      TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast search
CREATE INDEX IF NOT EXISTS idx_vouchers_code          ON public.vouchers (code);
CREATE INDEX IF NOT EXISTS idx_vouchers_customer_name ON public.vouchers (lower(customer_name));
CREATE INDEX IF NOT EXISTS idx_vouchers_email         ON public.vouchers (lower(customer_email));
CREATE INDEX IF NOT EXISTS idx_vouchers_phone         ON public.vouchers (phone);
CREATE INDEX IF NOT EXISTS idx_vouchers_status        ON public.vouchers (status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vouchers_updated_at ON public.vouchers;
CREATE TRIGGER vouchers_updated_at
  BEFORE UPDATE ON public.vouchers
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers  ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own; admins can read all
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Vouchers: all authenticated staff can read
CREATE POLICY "Authenticated staff can view vouchers"
  ON public.vouchers FOR SELECT
  TO authenticated
  USING (true);

-- Vouchers: authenticated staff can insert
CREATE POLICY "Authenticated staff can create vouchers"
  ON public.vouchers FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Vouchers: authenticated staff can update (redeem/cancel logic enforced in app)
CREATE POLICY "Authenticated staff can update vouchers"
  ON public.vouchers FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================
-- HELPER FUNCTION: auto-expire vouchers (optional, run via cron)
-- ============================================================
CREATE OR REPLACE FUNCTION public.expire_vouchers()
RETURNS void AS $$
BEGIN
  UPDATE public.vouchers
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SEED: Create first admin user
-- ============================================================
-- After running this schema, go to Supabase Dashboard → Authentication → Users
-- Create a user, then manually update their role in the profiles table:
--
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@flowerhotel.al';
--
-- ============================================================
