# 🌸 Flower Hotel — Voucher Management System

A production-ready internal gift voucher management system built with **Next.js 14 App Router** and **Supabase**.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Email | Resend API |
| Styling | Tailwind CSS |
| Language | TypeScript |

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- A [Resend](https://resend.com) account (free tier: 3,000 emails/month)

---

## 1. Clone & Install

```bash
# Install dependencies
npm install
```

---

## 2. Supabase Setup

### Create Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Note your **Project URL** and **Anon Key** from Settings → API

### Run the Schema
1. Go to Supabase Dashboard → **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Paste and click **Run**

### Create First Admin User
1. Go to **Authentication → Users → Add user**
2. Enter email and password (e.g. `admin@flowerhotel.al`)
3. After creation, run in SQL Editor:
```sql
UPDATE public.profiles 
SET role = 'admin', full_name = 'Hotel Admin'
WHERE email = 'admin@flowerhotel.al';
```

### Create Reception Staff User
```sql
-- After creating user in Auth dashboard:
UPDATE public.profiles 
SET role = 'reception', full_name = 'Front Desk'
WHERE email = 'reception@flowerhotel.al';
```

---

## 3. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# === SUPABASE ===
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5c...   # Settings → API → service_role

# === RESEND (EMAIL) ===
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx

# === HOTEL BRANDING ===
NEXT_PUBLIC_HOTEL_NAME=Flower Hotel & Resort
NEXT_PUBLIC_HOTEL_EMAIL=info@flowerhotel.al
NEXT_PUBLIC_HOTEL_PHONE=+355 69 123 4567
NEXT_PUBLIC_HOTEL_ADDRESS=Golem, Kavajë, Albania
NEXT_PUBLIC_HOTEL_WEBSITE=https://flowerhotel.al

# === APP ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ Never commit `.env.local` to git. It's already in `.gitignore`.

---

## 4. Resend Email Setup

1. Go to [resend.com](https://resend.com) → API Keys → Create Key
2. In Resend → Domains → Add your hotel domain (`flowerhotel.al`)
3. Add the DNS records they provide to your domain registrar
4. Once verified, emails will send from `info@flowerhotel.al`

> For testing without a domain: use `onboarding@resend.dev` as sender (update in `lib/sendEmail.ts`)

---

## 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

---

## 6. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add env variables in Vercel dashboard or:
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... repeat for all vars
```

Set `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://vouchers.flowerhotel.al`).

---

## Folder Structure

```
flower-vouchers/
├── app/
│   ├── api/
│   │   ├── vouchers/
│   │   │   ├── route.ts              # POST: create voucher
│   │   │   └── [code]/
│   │   │       ├── redeem/route.ts   # POST: redeem voucher
│   │   │       └── cancel/route.ts   # POST: cancel voucher (admin)
│   │   └── send-email/route.ts       # POST: send email to client
│   ├── login/page.tsx                # Staff login
│   ├── dashboard/page.tsx            # Stats + search + table
│   ├── vouchers/
│   │   ├── new/page.tsx              # Create voucher form
│   │   └── [code]/
│   │       ├── page.tsx              # Voucher detail + actions
│   │       └── print/page.tsx        # Printable voucher design
│   ├── globals.css
│   ├── layout.tsx
│   └── not-found.tsx
├── components/
│   ├── Navbar.tsx                    # Top navigation
│   ├── SearchBar.tsx                 # Search input
│   ├── NewVoucherForm.tsx            # Create voucher form
│   ├── VoucherActions.tsx            # Redeem/cancel/email/print/WhatsApp
│   └── VoucherCard.tsx              # Branded voucher visual
├── lib/
│   ├── supabase.ts                   # Browser client + types
│   ├── supabase-server.ts            # Server client
│   ├── generateCode.ts              # Code generator (HG-YYYY-XXXXX)
│   └── sendEmail.ts                  # Resend integration
├── supabase/
│   └── schema.sql                    # Full DB schema + RLS policies
├── middleware.ts                     # Route protection
├── .env.example
└── README.md
```

---

## Voucher Code Format

Codes are generated as: **`HG-YYYY-XXXXX`**

- `HG` = Hotel prefix (configurable in `lib/generateCode.ts`)
- `YYYY` = Current year
- `XXXXX` = 5-digit zero-padded random number

Example: `HG-2026-00421`

Uniqueness is verified against the database before insertion.

---

## Roles & Permissions

| Action | Reception | Admin |
|--------|-----------|-------|
| Login | ✅ | ✅ |
| View all vouchers | ✅ | ✅ |
| Create voucher | ✅ | ✅ |
| Redeem voucher | ✅ | ✅ |
| Send email | ✅ | ✅ |
| Print voucher | ✅ | ✅ |
| WhatsApp share | ✅ | ✅ |
| Cancel voucher | ❌ | ✅ |

---

## Auto-Expiry (Optional Cron)

To automatically mark expired vouchers, run this SQL periodically via Supabase's pg_cron or an external cron:

```sql
SELECT public.expire_vouchers();
```

Or set up a scheduled function in Supabase Dashboard → Database → Extensions → pg_cron.

---

## Support

Internal system for **Flower Hotel & Resort** staff only.
