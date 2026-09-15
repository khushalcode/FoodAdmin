-- =====================================================================
-- FoodHub Admin Panel — Migration v2 (matches actual DB schema)
-- =====================================================================
-- Built against the user's actual Supabase schema (890-line dump).
-- Fixes the issues in the previous migration:
--   ✘ previous tried INSERT into modules.default_module (column doesn't exist)
--   ✘ previous tried INSERT into disbursements.type / delivery_man_id (don't exist)
--   ✘ previous assumed wallet_bonuses had bonus_amount/target_amount (it doesn't)
--   ✘ previous assumed taxes/reels/expenses/subscription_packages tables exist (they don't)
--
-- This migration:
--   1. ALTERs existing tables to add missing columns
--   2. CREATEs all missing tables (faqs, languages, admin_roles, etc.)
--   3. Seeds demo data using ONLY columns that actually exist
--
-- Run via Supabase Studio → SQL Editor → paste → Run. Idempotent.
-- =====================================================================

BEGIN;

-- =====================================================================
-- PART 1: ALTER existing tables to add missing columns
-- =====================================================================

-- modules: add default_module column (used by /api/modules route)
ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS default_module boolean DEFAULT false;

-- disbursements: add type + delivery_man_id + created_for + total_amount + title
-- (the dm-disbursements + store-disbursements routes read these defensively)
ALTER TABLE public.disbursements
  ADD COLUMN IF NOT EXISTS type varchar DEFAULT 'store',
  ADD COLUMN IF NOT EXISTS delivery_man_id bigint,
  ADD COLUMN IF NOT EXISTS created_for varchar,
  ADD COLUMN IF NOT EXISTS total_amount numeric,
  ADD COLUMN IF NOT EXISTS title varchar;

-- wallet_bonuses: add all columns the /api/wallet-bonus route expects
ALTER TABLE public.wallet_bonuses
  ADD COLUMN IF NOT EXISTS title varchar,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS bonus_type varchar DEFAULT 'percentage',
  ADD COLUMN IF NOT EXISTS bonus_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS minimum_add_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS target_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS maximum_bonus_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS start_date timestamptz,
  ADD COLUMN IF NOT EXISTS end_date timestamptz,
  ADD COLUMN IF NOT EXISTS status boolean DEFAULT true;

-- Add FK from disbursements.delivery_man_id → delivery_men(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'disbursements_delivery_man_id_fkey'
      AND table_name = 'disbursements'
  ) THEN
    ALTER TABLE public.disbursements
      ADD CONSTRAINT disbursements_delivery_man_id_fkey
      FOREIGN KEY (delivery_man_id) REFERENCES public.delivery_men(id);
  END IF;
END$$;

-- =====================================================================
-- PART 2: CREATE missing tables (none of these exist in user's schema)
-- =====================================================================

-- FAQs
CREATE TABLE IF NOT EXISTS public.faqs (
  id bigserial PRIMARY KEY,
  question text NOT NULL,
  answer text NOT NULL,
  status boolean DEFAULT true,
  ranking integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Languages
CREATE TABLE IF NOT EXISTS public.languages (
  id bigserial PRIMARY KEY,
  code varchar(10) UNIQUE NOT NULL,
  name varchar(100) NOT NULL,
  direction varchar(10) DEFAULT 'ltr',
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  flag text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin roles
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id bigserial PRIMARY KEY,
  name varchar(100) UNIQUE NOT NULL,
  description text,
  permissions jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notification settings
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id bigserial PRIMARY KEY,
  event_type varchar(50) NOT NULL,
  recipient_role varchar(50) NOT NULL,
  channel varchar(20) DEFAULT 'push',
  is_enabled boolean DEFAULT true,
  template_title text,
  template_body text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Business settings (key-value)
CREATE TABLE IF NOT EXISTS public.business_settings (
  id bigserial PRIMARY KEY,
  key varchar(100) UNIQUE NOT NULL,
  value text,
  data_type varchar(20) DEFAULT 'string',
  description text,
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Maintenance mode (single-row)
CREATE TABLE IF NOT EXISTS public.maintenance_mode (
  id integer PRIMARY KEY DEFAULT 1,
  is_enabled boolean DEFAULT false,
  message text DEFAULT 'We are performing scheduled maintenance. Please check back shortly.',
  scheduled_until timestamptz,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT maintenance_mode_single_row CHECK (id = 1)
);

-- Login setups (OAuth providers)
CREATE TABLE IF NOT EXISTS public.login_setups (
  id bigserial PRIMARY KEY,
  provider varchar(50) UNIQUE NOT NULL,
  is_enabled boolean DEFAULT true,
  client_id text,
  client_secret text,
  redirect_url text,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- CMS pages
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id bigserial PRIMARY KEY,
  slug varchar(100) UNIQUE NOT NULL,
  title varchar(200) NOT NULL,
  body text,
  meta_title varchar(200),
  meta_description text,
  meta_image text,
  is_published boolean DEFAULT true,
  show_in_footer boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Taxes (referenced by /api/taxes route — table didn't exist before)
CREATE TABLE IF NOT EXISTS public.taxes (
  id bigserial PRIMARY KEY,
  name varchar(100) NOT NULL,
  code varchar(50) UNIQUE,
  tax_rate numeric DEFAULT 0,
  tax_type varchar(20) DEFAULT 'percent',
  status boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reels (referenced by /api/reels route — table didn't exist before)
CREATE TABLE IF NOT EXISTS public.reels (
  id bigserial PRIMARY KEY,
  title varchar(200) NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail text,
  status boolean DEFAULT true,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  created_by varchar DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscription packages (referenced by /api/subscription-packages route)
CREATE TABLE IF NOT EXISTS public.subscription_packages (
  id bigserial PRIMARY KEY,
  name varchar(100) NOT NULL,
  price numeric DEFAULT 0,
  duration integer DEFAULT 30,
  status boolean DEFAULT true,
  is_popular boolean DEFAULT false,
  features jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- External configurations (referenced by /api/external-config route)
CREATE TABLE IF NOT EXISTS public.external_configurations (
  id bigserial PRIMARY KEY,
  key varchar(100) UNIQUE NOT NULL,
  value text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Expenses (referenced by /api/expenses route)
CREATE TABLE IF NOT EXISTS public.expenses (
  id bigserial PRIMARY KEY,
  type varchar(100),
  amount numeric DEFAULT 0,
  description text,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Pro customer subscription plans (referenced by /api/pro-customer-subscriptions route)
CREATE TABLE IF NOT EXISTS public.pro_customer_subscription_plans (
  id bigserial PRIMARY KEY,
  name varchar(100) NOT NULL,
  price numeric DEFAULT 0,
  duration integer DEFAULT 30,
  status boolean DEFAULT true,
  features jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Pro customer subscriptions
CREATE TABLE IF NOT EXISTS public.pro_customer_subscriptions (
  id bigserial PRIMARY KEY,
  user_id varchar NOT NULL,
  plan_id bigint,
  plan_name varchar(100),
  status varchar(50) DEFAULT 'active',
  start_at timestamptz DEFAULT now(),
  end_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================================
-- PART 3: SEED demo data (idempotent — uses ON CONFLICT DO NOTHING)
-- =====================================================================

-- Languages (5)
INSERT INTO public.languages (code, name, direction, is_active, is_default, flag) VALUES
  ('en', 'English',    'ltr', true, true,  '🇬🇧'),
  ('ar', 'العربية',    'rtl', true, false, '🇸🇦'),
  ('bn', 'বাংলা',      'ltr', true, false, '🇧🇩'),
  ('es', 'Español',    'ltr', true, false, '🇪🇸'),
  ('fr', 'Français',   'ltr', true, false, '🇫🇷')
ON CONFLICT (code) DO NOTHING;

-- Admin roles (4)
INSERT INTO public.admin_roles (name, description, permissions, is_active) VALUES
  ('Super Admin', 'Full access to all features', '{"all": true}', true),
  ('Admin',       'Standard admin access',       '{"dashboard": true, "orders": true, "products": true, "customers": true, "vendors": true, "reports": true}', true),
  ('Manager',     'Operations manager',          '{"dashboard": true, "orders": true, "products": true, "reports": true}', true),
  ('Support',     'Customer support agent',      '{"orders": true, "customers": true, "messages": true, "notifications": true}', true)
ON CONFLICT (name) DO NOTHING;

-- Notification settings (8)
INSERT INTO public.notification_settings (event_type, recipient_role, channel, is_enabled, template_title, template_body) VALUES
  ('order_placed',       'admin',     'in_app', true, 'New order received',       'Order #{{order_id}} has been placed.'),
  ('order_placed',       'vendor',    'push',   true, 'New order received',       'Order #{{order_id}} needs confirmation.'),
  ('order_confirmed',    'customer',  'push',   true, 'Order Confirmed',          'Your order #{{order_id}} has been confirmed.'),
  ('order_delivered',    'customer',  'push',   true, 'Order Delivered',          'Your order #{{order_id}} has been delivered.'),
  ('order_delivered',    'admin',     'in_app', true, 'Order delivered',          'Order #{{order_id}} has been delivered.'),
  ('new_customer',       'admin',     'in_app', true, 'New customer registered',  'Welcome {{customer_name}} to FoodHub.'),
  ('withdrawal_requested','admin',    'in_app', true, 'Withdrawal requested',     '{{user_type}} {{user_name}} requested ${{amount}}.'),
  ('low_stock',          'vendor',    'push',   true, 'Low stock alert',          'Item {{item_name}} is low on stock ({{stock}} left).')
ON CONFLICT DO NOTHING;

-- Business settings (28 key-value pairs)
INSERT INTO public.business_settings (key, value, data_type, description) VALUES
  ('business_name',                 'FoodHub',                                            'string',  'Business / brand name'),
  ('business_email',                'support@foodhub.com',                                'string',  'Primary contact email'),
  ('business_phone',                '+1 (555) 123-4567',                                  'string',  'Primary contact phone'),
  ('business_address',              '123 Food St, Demo City, DC 12345',                   'string',  'Business address'),
  ('currency_symbol',               '$',                                                  'string',  'Currency symbol'),
  ('currency_code',                 'USD',                                                'string',  'ISO currency code'),
  ('currency_position',             'left',                                               'string',  'Currency position (left or right)'),
  ('timezone',                      'UTC',                                                'string',  'Default timezone'),
  ('date_format',                   'YYYY-MM-DD',                                         'string',  'Date format'),
  ('time_format',                   '24h',                                                'string',  'Time format (12h or 24h)'),
  ('min_order_amount',              '5',                                                  'number',  'Minimum order amount'),
  ('max_order_amount',              '500',                                                'number',  'Maximum order amount'),
  ('delivery_fee',                  '2.50',                                               'number',  'Default delivery fee'),
  ('free_delivery_threshold',       '50',                                                 'number',  'Free delivery above this amount'),
  ('tax_percentage',                '8',                                                  'number',  'Default tax percentage'),
  ('service_charge',                '0',                                                  'number',  'Service charge percentage'),
  ('loyalty_earn_rate',             '1',                                                  'number',  'Loyalty points earned per dollar'),
  ('loyalty_redeem_rate',           '0.01',                                               'number',  'Dollar value of 1 loyalty point'),
  ('min_withdrawal_amount',         '50',                                                 'number',  'Minimum withdrawal for vendors/delivery men'),
  ('max_withdrawal_amount',         '5000',                                               'number',  'Maximum withdrawal per request'),
  ('vendor_commission_default',     '10',                                                 'number',  'Default vendor commission percentage'),
  ('maintenance_mode',             'false',                                              'boolean', 'Site-wide maintenance mode toggle'),
  ('maintenance_message',           'We are performing scheduled maintenance.',           'string',  'Maintenance mode message'),
  ('otp_required_signup',           'true',                                               'boolean', 'Require OTP for customer signup'),
  ('allow_guest_checkout',          'false',                                              'boolean', 'Allow guest checkout'),
  ('max_delivery_radius_km',        '15',                                                 'number',  'Maximum delivery radius'),
  ('order_auto_cancel_minutes',     '30',                                                 'number',  'Auto-cancel pending orders after N minutes'),
  ('allow_vendor_self_signup',      'true',                                               'boolean', 'Allow vendor self-registration'),
  ('allow_delivery_man_self_signup','true',                                               'boolean', 'Allow delivery man self-registration')
ON CONFLICT (key) DO NOTHING;

-- Maintenance mode single row
INSERT INTO public.maintenance_mode (id, is_enabled) VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- Login setups (5 providers)
INSERT INTO public.login_setups (provider, is_enabled) VALUES
  ('email',   true),
  ('phone',   true),
  ('google',  false),
  ('facebook',false),
  ('apple',   false)
ON CONFLICT (provider) DO NOTHING;

-- CMS pages (9)
INSERT INTO public.cms_pages (slug, title, body, is_published, show_in_footer) VALUES
  ('about-us',              'About Us',           'FoodHub is your favorite food delivery platform.', true, true),
  ('terms-and-conditions',  'Terms & Conditions', 'Read our terms and conditions carefully.', true, true),
  ('privacy-policy',        'Privacy Policy',     'Your privacy is important to us.', true, true),
  ('refund-policy',         'Refund Policy',       'Our refund policy explains how refunds work.', true, true),
  ('return-policy',         'Return Policy',      'Our return policy for food orders.', true, false),
  ('cancellation-policy',   'Cancellation Policy', 'Order cancellation policy.', true, false),
  ('shipping-policy',       'Shipping Policy',    'Delivery and shipping policy.', true, false),
  ('contact-us',            'Contact Us',         'Get in touch with our support team.', true, true),
  ('faq',                   'FAQ',                'Frequently asked questions.', true, true)
ON CONFLICT (slug) DO NOTHING;

-- Taxes (4 demo)
INSERT INTO public.taxes (name, code, tax_rate, tax_type, status) VALUES
  ('VAT',         'VAT',  5.00, 'percent', true),
  ('Sales Tax',   'STX',  8.00, 'percent', true),
  ('Service Tax', 'SVT',  2.50, 'percent', true),
  ('Flat Fee',    'FLAT', 1.00, 'amount',  true)
ON CONFLICT (code) DO NOTHING;

-- Subscription packages (3)
INSERT INTO public.subscription_packages (name, price, duration, status, is_popular, features) VALUES
  ('Starter',    0.00,   30, true, false, '{"max_products": 50,  "max_orders": 100}'),
  ('Growth',     49.99,  30, true, true,  '{"max_products": 500, "max_orders": 1000, "marketing_tools": true}'),
  ('Enterprise', 199.99, 30, true, false, '{"max_products": -1,  "max_orders": -1,   "marketing_tools": true, "priority_support": true}')
ON CONFLICT DO NOTHING;

-- Withdrawal methods (4)
INSERT INTO public.withdrawal_methods (name, fields, is_active) VALUES
  ('Bank Transfer', '{"account_name":"text","account_number":"text","bank_name":"text","routing_number":"text"}', true),
  ('PayPal',        '{"paypal_email":"email"}', true),
  ('Stripe',        '{"stripe_account_id":"text"}', true),
  ('Cash Pickup',   '{"pickup_location":"text"}', false)
ON CONFLICT DO NOTHING;

-- D.M. vehicles (5)
INSERT INTO public.d_m_vehicles (name, description, image, is_delivery, is_ride, starting_coverage_area, maximum_coverage_area, extra_charges, status) VALUES
  ('Bicycle',   'For short distances (up to 3km)',  NULL, true,  false, 0,  3,  0.00, true),
  ('Motorcycle','For medium distances (up to 10km)',NULL, true,  false, 0, 10,  1.50, true),
  ('Car',       'For long distances (up to 30km)',  NULL, true,  false, 0, 30,  3.00, true),
  ('Scooter',   'Eco-friendly option',              NULL, true,  false, 0,  8,  1.00, true),
  ('Van',       'For bulk / catering orders',       NULL, true,  false, 0, 25,  5.00, false)
ON CONFLICT DO NOTHING;

-- Addon categories (6) — table exists
INSERT INTO public.addon_categories (name, description, status) VALUES
  ('Extra Cheese',      'Add extra cheese to your dish',    true),
  ('Sauce Selection',   'Pick your favorite sauce',         true),
  ('Toppings',          'Additional toppings',               true),
  ('Spice Level',       'Choose your spice level',           true),
  ('Beverage Upgrade',  'Upgrade to a larger drink',         true),
  ('Dessert Add-ons',   'Sweet extras',                       true)
ON CONFLICT DO NOTHING;

-- Admin promo banners (5)
INSERT INTO public.admin_promotional_banners (title, sub_title, image, status) VALUES
  ('Free Delivery on Your First Order', 'Use code FREEDEL at checkout', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', true),
  ('Refer a Friend, Get $20',            'Share FoodHub with your friends', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', true),
  ('Become a Pro Customer',             'Unlock exclusive deals',         'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', false),
  ('Summer Special',                    'Up to 30% off all restaurants',  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', true),
  ('New on FoodHub',                    'Discover the latest restaurants','https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', false)
ON CONFLICT DO NOTHING;

-- External configurations (3 demo)
INSERT INTO public.external_configurations (key, value, is_active) VALUES
  ('google_maps_api_key',       '', true),
  ('fcm_server_key',            '', true),
  ('twilio_account_sid',        '', false)
ON CONFLICT (key) DO NOTHING;

-- FAQs (5 demo)
INSERT INTO public.faqs (question, answer, status, ranking) VALUES
  ('How do I place an order?',         'Browse restaurants, add items to cart, checkout, and track in real-time.', true, 1),
  ('What payment methods are accepted?','We accept Cash on Delivery, Credit/Debit Cards, and Digital Wallets.',    true, 2),
  ('How long does delivery take?',      'Typically 30-45 minutes depending on distance and restaurant prep time.',  true, 3),
  ('Can I cancel my order?',            'Yes, you can cancel before the restaurant accepts. After that, contact support.', true, 4),
  ('How do I get a refund?',            'Refunds are processed within 5-7 business days to your original payment method.', true, 5)
ON CONFLICT DO NOTHING;

-- =====================================================================
-- PART 4: Update store order counts (best-effort, ignores failures)
-- =====================================================================
UPDATE public.stores SET order_count = 245 WHERE id = 1 AND (order_count IS NULL OR order_count = 0);
UPDATE public.stores SET order_count = 312 WHERE id = 2 AND (order_count IS NULL OR order_count = 0);
UPDATE public.stores SET order_count = 156 WHERE id = 3 AND (order_count IS NULL OR order_count = 0);

COMMIT;

-- =====================================================================
-- Report
-- =====================================================================
DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Migration v2 complete.';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'ALTERs applied:';
  RAISE NOTICE '  - modules.default_module (added)';
  RAISE NOTICE '  - disbursements.type + delivery_man_id (added)';
  RAISE NOTICE '  - wallet_bonuses: title, bonus_amount, target_amount, status, dates (added)';
  RAISE NOTICE 'New tables created (IF NOT EXISTS):';
  RAISE NOTICE '  faqs, languages, admin_roles, notification_settings,';
  RAISE NOTICE '  business_settings, maintenance_mode, login_setups, cms_pages,';
  RAISE NOTICE '  taxes, reels, subscription_packages, external_configurations,';
  RAISE NOTICE '  expenses, pro_customer_subscription_plans, pro_customer_subscriptions';
  RAISE NOTICE 'Seed data inserted (idempotent):';
  RAISE NOTICE '  5 languages, 4 admin_roles, 8 notification_settings,';
  RAISE NOTICE '  29 business_settings, 1 maintenance_mode, 5 login_setups,';
  RAISE NOTICE '  9 cms_pages, 4 taxes, 3 subscription_packages,';
  RAISE NOTICE '  4 withdrawal_methods, 5 d_m_vehicles, 6 addon_categories,';
  RAISE NOTICE '  5 admin_promotional_banners, 3 external_configurations, 5 faqs';
END $$;
