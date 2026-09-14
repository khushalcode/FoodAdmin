# FoodHub Admin — Real Supabase Setup

This version uses your **real Supabase database** with the `foodhub_final_setup.sql` schema. The SQL file creates ALL tables, RLS policies, demo users, and demo business data in one shot — no separate seed script needed.

> **If you've already run `supabase/schema.sql` and login shows "Invalid credentials"**, jump straight to step **2b — Fix broken demo auth users** below. The original `create_auth_user()` helper in the schema didn't populate `auth.identities` rows, so GoTrue can't load the demo users it created. The cleanup file fixes that in one shot.

## Quick Setup (5 minutes)

### 1. Create a Supabase project (free)
1. Go to https://supabase.com and sign up
2. Click **New Project** → choose a name → click **Create**
3. Wait ~2 min for provisioning

### 2a. Run the schema + seed (ONE file does both) — fresh install only
1. In your Supabase Dashboard, click **SQL Editor** → **New Query**
2. Open the file `supabase/schema.sql` (this is your `foodhub_final_setup.sql`)
3. Copy ALL the contents and paste into the SQL editor
4. Click **Run** — this creates:
   - 167 tables (modules, zones, users, admins, vendors, stores, items, orders, order_details, order_transactions, reviews, withdraw_requests, user_notifications, banners, coupons, campaigns, flash_sales, delivery_men, and 150+ more)
   - 18 enum types (user_role, order_status_type, payment_status_type, etc.)
   - 70 RLS policies
   - Triggers for auto-profile creation on auth.users signup
   - **11 demo auth users** (2 admins, 3 vendors, 3 customers, 3 delivery boys) — created with proper `auth.identities` rows
   - Demo business data (4 restaurants, 8 categories, 25 dishes, 10 orders, banners, coupons, etc.)
5. You should see "Success" messages with the demo credentials printed

### 2b. Fix broken demo auth users — IF YOU'VE ALREADY RUN schema.sql AND LOGIN FAILS
If you ran an older version of `schema.sql` and now login returns "Invalid credentials", the demo auth.users rows were created without `auth.identities` rows. Fix it with one short SQL run:

1. In your Supabase Dashboard, click **SQL Editor** → **New Query**
2. Open `supabase/cleanup.sql`
3. Copy ALL the contents and paste into the SQL editor
4. Click **Run** — this will:
   - Drop the 11 broken demo auth.users (cascade-deletes their `user_profiles` rows)
   - Drop the buggy `create_auth_user()` function
   - Re-define `create_auth_user()` with the fix (also inserts `auth.identities` rows + handles newer `is_anonymous` column)
   - Re-create all 11 demo auth.users with proper `auth.identities` rows
   - Re-insert the matching `user_profiles` rows
5. You should see "CLEANUP + RECREATE COMPLETE" + a count of 11 auth.users, 11 auth.identities, 11 user_profiles.

After running `cleanup.sql`, login with `admin1@example.com / admin123` will work.

### 3. Get your API keys
1. In Supabase Dashboard → **Settings** → **API**
2. Copy these 3 values:
   - **Project URL** (looks like `https://abc123xyz.supabase.co`)
   - **anon public** key
   - **service_role** key (keep secret!)

### 4. Configure .env
1. Rename `.env.example` → `.env`
2. Replace the placeholders with your real values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key...
```

### 5. Install + run
```bash
bun install
bun run dev
```

Open http://localhost:3000 — you should see the FoodHub login page. Sign in with any demo account.

## Demo Credentials (created by the SQL file)

### Admins
| Email | Password | Name |
|-------|----------|------|
| admin1@example.com | admin123 | Rahul Sharma |
| admin2@example.com | admin456 | Priya Verma |

### Vendors (Restaurant Owners)
| Email | Password | Store |
|-------|----------|-------|
| vendor1@demo.com | Vendor@1234 | Burger Junction |
| vendor2@demo.com | Vendor@1234 | Pizza Palace |
| vendor3@demo.com | Vendor@1234 | Sushi World |

### Customers
| Email | Password | Name |
|-------|----------|------|
| customer1@demo.com | Customer@1234 | John Customer |
| customer2@demo.com | Customer@1234 | Sarah Buyer |
| customer3@demo.com | Customer@1234 | Mike Shopper |

### Delivery Boys
| Email | Password | Name |
|-------|----------|------|
| dm1@demo.com | Delivery@1234 | John Driver |
| dm2@demo.com | Delivery@1234 | Sara Rider |
| dm3@demo.com | Delivery@1234 | Mike Delivery |

## Demo Business Data (also created by the SQL file)

- **4 Restaurants**: Burger Junction, Pizza Palace, Sushi World, Taco Fiesta
- **8 Categories**: Burgers, Pizza, Sushi, Salads, Desserts, Drinks, Sides, Combos
- **25 Dishes**: Classic Cheeseburger, Double Bacon Burger, Margherita Pizza, California Roll, etc.
- **10 Orders**: Various statuses (pending, confirmed, processing, delivered, canceled)
- **3 Banners**: Free Delivery, 20% Off Pizzas, New Restaurants
- **3 Coupons**: WELCOME10, PIZZA20, FREEDEL
- **3 Delivery Men**: With vehicles and zone assignments
- **Customer addresses, wallet balances, loyalty points**

## Schema Overview (167 tables — key ones)

| Table | Purpose | Used by |
|-------|---------|---------|
| `auth.users` | Supabase Auth accounts | All apps |
| `user_profiles` | Links auth.users to roles (admin/vendor/customer/delivery-man) | All apps |
| `users` | Legacy customer table (wallet_balance, loyalty_point, ref_code) | Admin, Customer |
| `admins` | Legacy admin table | Admin |
| `vendors` | Business owners | Admin, Vendor |
| `stores` | Storefronts (linked to vendors) | Admin, Vendor, Customer |
| `categories` | Food categories | Admin, Vendor, Customer |
| `items` | Products/dishes (NOT "products") | Admin, Vendor, Customer |
| `orders` | Customer orders (uses `order_amount`, NOT `total`) | All apps |
| `order_details` | Line items in orders | All apps |
| `order_transactions` | Financial breakdown per order | Admin |
| `reviews` | Vendor/store reviews | Admin, Vendor, Customer |
| `withdraw_requests` | Vendor payout requests | Admin, Vendor |
| `user_notifications` | Per-user notifications | All apps |
| `delivery_men` | Delivery personnel | Admin, Delivery |
| `banners`, `coupons`, `campaigns`, `flash_sales` | Marketing | Admin, Vendor |
| `zones`, `modules`, `module_zone` | Geographic + vertical config | Admin |

## RLS (Row Level Security)

70 RLS policies are created by the SQL file:
- Public read for catalog tables (modules, zones, categories, stores, items, banners, coupons)
- Owner-only CRUD for personal data (customer_addresses, carts, wishlists, orders)
- Service role bypasses all RLS (used by admin API routes)

## All Admin Tabs (60+ tabs — restored from old admin)

The admin panel now has **all the tabs from the original Archive.zip**, organized into 9 groups:

### Main (1 tab)
Dashboard

### Menu Management (6 tabs)
Categories, Sub Categories, Dishes, Attributes, Brands, Units

### Orders & Sales (9 tabs)
Orders, POS, POS Orders, Flash Sales, Campaigns, Coupons, Banners, Other Banners, Promotions

### Restaurants (5 tabs)
Restaurants, Restaurant Categories, Restaurant Applications, Payout Requests, Disbursements

### Customers (5 tabs)
Customers, Pro Customers, Customer Wallet, Wallet Bonus, Loyalty Points

### Delivery Boys (5 tabs)
Delivery Boys, Vehicles, Earnings, Disbursements (DM), Track Delivery Boy

### Reports (5 tabs)
Reports Overview, Earning Reports, Tax Reports, Transactions, DM Earnings Reports

### Modules (9 tabs — restored)
Modules, Tax Module, Reels Module, Ride Share, Rental, Parcel Categories, Parcel Orders, Parcel Dispatch, Page Builder

### Settings (16 tabs — restored)
AI Assistant, Business Settings, System Settings, Pages Setup, Login Setup, Languages, Roles & Permissions, Employees, Zones, Notifications, Messages, File Manager, External Config, Maintenance Mode, Addons, Addon Activation

## Connecting the Mobile Apps (Vendor + Delivery)

Both mobile apps already have `src/lib/supabase.ts` — just update 2 lines with the same Supabase URL + anon key from your `.env`:

```ts
export const supabaseUrl = 'https://YOUR-PROJECT-REF.supabase.co';
export const supabaseAnonKey = 'YOUR-SUPABASE-ANON-KEY';
```

All 3 apps (admin web + vendor mobile + delivery mobile) now share the **same users, vendors, stores, items, orders, reviews, withdrawals** — real-time, real database.

## Troubleshooting

**"supabaseUrl is required" error in dev.log**
- You haven't configured `.env` yet. Copy `.env.example` → `.env` and add your real Supabase keys.

**"Invalid credentials" on login**
- Make sure you ran the entire `supabase/schema.sql` in the Supabase SQL Editor (it creates the auth users)
- Check that the email matches exactly (case-sensitive)
- The password must be exact (admin123, not Admin123)

**"This account is not a {role} account"**
- You selected the wrong role on the login screen
- Each demo account has a fixed role — match the role to the email
- Note: the SQL uses role `delivery-man` (with hyphen), the login screen uses `delivery` — the app normalizes this

**API returns 500 / empty data**
- Verify `.env` has the correct `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- Make sure you ran the ENTIRE `supabase/schema.sql` (it's 5500+ lines — don't stop early)
- Check Supabase Dashboard → Table Editor to verify tables exist + have data

**Mobile app can't connect**
- Verify the Supabase URL + anon key are set correctly in `src/lib/supabase.ts` and `app.json`
- Make sure you're using the **anon key** (not the service role key) in the mobile apps

## File Structure

```
.
├── supabase/
│   └── schema.sql          # ← your foodhub_final_setup.sql (run in Supabase SQL Editor)
├── src/
│   ├── lib/
│   │   └── supabase/
│   │       ├── server.ts    # server client (cookies-bound) + service-role client
│   │       ├── client.ts    # browser client (anon key)
│   │       └── admin.ts     # service-role client (bypasses RLS) — used by all API routes
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/login/        # POST — validates via Supabase Auth + user_profiles.role
│   │   │   ├── auth/me/           # GET — fetches user + vendor info
│   │   │   ├── dashboard/stats/    # GET — admin KPIs from orders + items + stores + users
│   │   │   ├── orders/             # GET — all orders with store + delivery_man joins
│   │   │   ├── products/           # GET — all items (real table name)
│   │   │   ├── vendors/            # GET — all stores (real table name)
│   │   │   ├── notifications/      # GET — user_notifications
│   │   │   ├── activities/          # GET — synthesized from recent orders
│   │   │   └── vendor/
│   │   │       ├── dashboard/      # GET — store-scoped stats
│   │   │       ├── orders/         # GET — store's orders
│   │   │       ├── products/       # GET — store's items
│   │   │       ├── reviews/        # GET — store's reviews
│   │   │       └── withdrawals/    # GET + POST — withdraw_requests (POST creates real DB record)
│   │   └── ...
│   └── components/foodhub/    # admin UI (60+ tabs) + vendor UI (12 tabs)
├── .env                    # ← your Supabase keys go here
└── SETUP.md                # ← this file
```

## Production Notes

- The SQL file uses dynamic SQL (`create_auth_user()` function) to create auth.users — this works on any Supabase version
- Email confirmations are auto-set to `NOW()` for demo users (no email verification needed)
- For production: configure proper auth providers (Google, Apple) in Dashboard → Authentication → Providers
- Update RLS policies if you need stricter access control
- Set up Supabase Storage for product images, vendor logos
- Configure webhooks for real-time order updates if needed
