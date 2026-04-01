-- ============================================================
-- MIGRATION: Add new fields to vouchers + gift_categories table
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add new columns to vouchers
ALTER TABLE public.vouchers
  ADD COLUMN IF NOT EXISTS gifter_name     TEXT,
  ADD COLUMN IF NOT EXISTS gifter_email    TEXT,
  ADD COLUMN IF NOT EXISTS checkin_date    DATE,
  ADD COLUMN IF NOT EXISTS checkout_date   DATE,
  ADD COLUMN IF NOT EXISTS package_notes   TEXT,
  ADD COLUMN IF NOT EXISTS category_id     UUID,
  ADD COLUMN IF NOT EXISTS image_url       TEXT;

-- Gift card categories table
CREATE TABLE IF NOT EXISTS public.gift_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  elements    TEXT[],
  image_url   TEXT,
  base_price  NUMERIC(10,2),
  active      BOOLEAN DEFAULT true,
  created_by  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for categories
ALTER TABLE public.gift_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated staff can view categories"
  ON public.gift_categories FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated staff can insert categories"
  ON public.gift_categories FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated staff can update categories"
  ON public.gift_categories FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "Authenticated staff can delete categories"
  ON public.gift_categories FOR DELETE
  TO authenticated USING (true);

-- Storage bucket for images (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gift-images', 'gift-images', true);
