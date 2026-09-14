

-- Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "extensions";

-- ============ ENUM TYPES ============
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super-admin','admin','vendor','store-owner','employee','delivery-man','rider','customer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE vendor_status AS ENUM ('pending','approved','rejected','suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status_type AS ENUM ('pending','confirmed','processing','handover','picked_up','delivered','canceled','refunded','failed','scheduled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_type AS ENUM ('unpaid','paid','refunded','partial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method_type AS ENUM ('cash_on_delivery','digital_payment','wallet','stripe','razorpay','paypal','paystack','sslcommerz','mercadopago','flutterwave','paytm');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_type_enum AS ENUM ('delivery','take_away','parcel','ride','rental','service');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE discount_type_enum AS ENUM ('amount','percent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tax_type_enum AS ENUM ('include','exclude');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE module_type_enum AS ENUM ('grocery','food','pharmacy','shop','parcel','rental','ride','service');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE delivery_charge_type_enum AS ENUM ('fixed','distance');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE store_business_model_enum AS ENUM ('none','commission','subscription','unsubscribed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE login_medium_enum AS ENUM ('email','phone','google','facebook','apple');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE address_type_enum AS ENUM ('home','work','delivery','billing');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE advertisement_type_enum AS ENUM ('small','big','small_with_close');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE banner_type_enum AS ENUM ('web','app','store_wise','item_wise','taxi');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE coupon_type_enum AS ENUM ('default','store_base','first_order','category_base','item_wise');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE campaign_status_enum AS ENUM ('running','paused','expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_status_enum AS ENUM ('pending','approved','rejected','suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ MODULES (verticals) ============
CREATE TABLE IF NOT EXISTS modules (
  id BIGSERIAL PRIMARY KEY,
  module_name VARCHAR(255) NOT NULL,
  module_type module_type_enum NOT NULL DEFAULT 'grocery',
  thumbnail TEXT,
  icon TEXT,
  theme_id VARCHAR(255),
  status BOOLEAN NOT NULL DEFAULT TRUE,
  stores_count INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  short_description TEXT,
  all_zone_service BOOLEAN NOT NULL DEFAULT FALSE,
  slug VARCHAR(255) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ ZONES (geographic service areas) ============
CREATE TABLE IF NOT EXISTS zones (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  coordinates JSONB,
  cash_on_delivery BOOLEAN NOT NULL DEFAULT TRUE,
  digital_payment BOOLEAN NOT NULL DEFAULT TRUE,
  increased_delivery_fee BOOLEAN NOT NULL DEFAULT FALSE,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  rider_wise_topic VARCHAR(255),
  status BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ MODULE ↔ ZONE (delivery pricing) ============
CREATE TABLE IF NOT EXISTS module_zone (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  zone_id BIGINT NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  per_km_shipping_charge NUMERIC(8,2) NOT NULL DEFAULT 0,
  minimum_shipping_charge NUMERIC(8,2) NOT NULL DEFAULT 0,
  maximum_shipping_charge NUMERIC(8,2) NOT NULL DEFAULT 0,
  maximum_cod_order_amount NUMERIC(12,2),
  delivery_charge_type delivery_charge_type_enum NOT NULL DEFAULT 'fixed',
  fixed_shipping_charge NUMERIC(8,2) NOT NULL DEFAULT 0,
  UNIQUE(module_id, zone_id)
);

-- ============ USER_PROFILES (auth.users ↔ role) ============
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,  -- FK to auth.users.id (added below after auth.users exists)
  role user_role NOT NULL DEFAULT 'customer',
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
DO $$ BEGIN
  ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ LEGACY users (customers table, used by admin + customer app) ============
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50) UNIQUE,
  password VARCHAR(255),
  image TEXT,
  login_medium login_medium_enum NOT NULL DEFAULT 'email',
  social_id VARCHAR(255),
  is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  cm_firebase_token TEXT,
  status user_status_enum NOT NULL DEFAULT 'pending',
  order_count INTEGER NOT NULL DEFAULT 0,
  wallet_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  loyalty_point NUMERIC(12,2) NOT NULL DEFAULT 0,
  ref_code VARCHAR(50) UNIQUE,
  ref_by BIGINT,
  current_language_key VARCHAR(10) DEFAULT 'en',
  temp_token VARCHAR(255),
  is_from_pos BOOLEAN NOT NULL DEFAULT FALSE,
  pro_status VARCHAR(50) DEFAULT 'inactive',
  interested_module_ids JSONB,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ ADMINS (legacy — admin panel uses auth.users + user_profiles now) ============
CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  password VARCHAR(255),
  image TEXT,
  is_logged_in BOOLEAN NOT NULL DEFAULT FALSE,
  login_remember_token VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  role user_role NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ VENDORS (business owners) ============
CREATE TABLE IF NOT EXISTS vendors (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo TEXT,
  address TEXT,
  lat VARCHAR(50),
  lng VARCHAR(50),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  password VARCHAR(255),
  status vendor_status NOT NULL DEFAULT 'pending',
  zone_id BIGINT REFERENCES zones(id) ON DELETE SET NULL,
  module_id BIGINT REFERENCES modules(id) ON DELETE SET NULL,
  application_status vendor_status NOT NULL DEFAULT 'pending',
  free_delivery BOOLEAN NOT NULL DEFAULT FALSE,
  cover_photo TEXT,
  tax NUMERIC(5,2) NOT NULL DEFAULT 0,
  minimum_order NUMERIC(12,2) NOT NULL DEFAULT 0,
  self_delivery_system BOOLEAN NOT NULL DEFAULT FALSE,
  delivery_charge NUMERIC(8,2) NOT NULL DEFAULT 0,
  schedule_order BOOLEAN NOT NULL DEFAULT FALSE,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  free_delivery_distance NUMERIC(8,2),
  login_remember_token VARCHAR(255),
  rejection_note TEXT,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ STORES (storefronts run by vendors) ============
CREATE TABLE IF NOT EXISTS stores (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  logo TEXT,
  lat VARCHAR(50),
  lng VARCHAR(50),
  address TEXT,
  minimum_order NUMERIC(12,2) NOT NULL DEFAULT 0,
  comission NUMERIC(5,2) NOT NULL DEFAULT 0,
  schedule_order BOOLEAN NOT NULL DEFAULT FALSE,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  vendor_id BIGINT REFERENCES vendors(id) ON DELETE SET NULL,
  free_delivery BOOLEAN NOT NULL DEFAULT FALSE,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  cover_photo TEXT,
  delivery BOOLEAN NOT NULL DEFAULT TRUE,
  take_away BOOLEAN NOT NULL DEFAULT FALSE,
  tax NUMERIC(5,2) NOT NULL DEFAULT 0,
  zone_id BIGINT REFERENCES zones(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  self_delivery_system BOOLEAN NOT NULL DEFAULT FALSE,
  pos_system BOOLEAN NOT NULL DEFAULT FALSE,
  module_id BIGINT REFERENCES modules(id) ON DELETE SET NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  slug VARCHAR(255) UNIQUE,
  store_business_model store_business_model_enum NOT NULL DEFAULT 'none',
  per_km_shipping_charge NUMERIC(8,2) NOT NULL DEFAULT 0,
  maximum_shipping_charge NUMERIC(8,2) NOT NULL DEFAULT 0,
  prescription_order BOOLEAN NOT NULL DEFAULT FALSE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_image TEXT,
  announcement TEXT,
  package_id BIGINT,
  pickup_zone_id BIGINT,
  tin VARCHAR(255),
  meta_data JSONB,
  order_count INTEGER NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  is_subscribed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ STORE CONFIG (per-store config blob) ============
CREATE TABLE IF NOT EXISTS store_configs (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  can_edit_order BOOLEAN NOT NULL DEFAULT FALSE,
  website_builder_status BOOLEAN NOT NULL DEFAULT FALSE,
  show_low_stock_count BOOLEAN NOT NULL DEFAULT FALSE,
  section_wise_ai_use_count INTEGER NOT NULL DEFAULT 0,
  meta_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(store_id)
);

-- ============ STORE CATEGORIES ============
CREATE TABLE IF NOT EXISTS store_categories (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  module_id BIGINT REFERENCES modules(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  priority INTEGER NOT NULL DEFAULT 0,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ CATEGORIES (product taxonomy) ============
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image TEXT,
  parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  position INTEGER NOT NULL DEFAULT 0,
  priority VARCHAR(20) NOT NULL DEFAULT 'low',
  status BOOLEAN NOT NULL DEFAULT TRUE,
  module_id BIGINT REFERENCES modules(id) ON DELETE SET NULL,
  slug VARCHAR(255) UNIQUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ BRANDS ============
CREATE TABLE IF NOT EXISTS brands (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  image TEXT,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  module_id BIGINT REFERENCES modules(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ UNITS ============
CREATE TABLE IF NOT EXISTS units (
  id BIGSERIAL PRIMARY KEY,
  unit VARCHAR(50) NOT NULL,
  description TEXT,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ ATTRIBUTES (size, color, etc.) ============
CREATE TABLE IF NOT EXISTS attributes (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ ADDON CATEGORIES ============
CREATE TABLE IF NOT EXISTS addon_categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ ADD-ONS ============
CREATE TABLE IF NOT EXISTS add_ons (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  addon_category_id BIGINT REFERENCES addon_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ ITEMS (products) ============
CREATE TABLE IF NOT EXISTS items (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  video TEXT,
  video_link TEXT,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  category_ids JSONB,
  store_id BIGINT REFERENCES stores(id) ON DELETE CASCADE,
  store_category_id BIGINT REFERENCES store_categories(id) ON DELETE SET NULL,
  module_id BIGINT REFERENCES modules(id) ON DELETE SET NULL,
  unit_id BIGINT REFERENCES units(id) ON DELETE SET NULL,
  brand_id BIGINT REFERENCES brands(id) ON DELETE SET NULL,
  images JSONB,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(5,2) NOT NULL DEFAULT 0,
  tax_type tax_type_enum NOT NULL DEFAULT 'exclude',
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_type discount_type_enum NOT NULL DEFAULT 'amount',
  veg BOOLEAN NOT NULL DEFAULT FALSE,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  stock INTEGER NOT NULL DEFAULT 0,
  slug VARCHAR(255) UNIQUE,
  order_count INTEGER NOT NULL DEFAULT 0,
  avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  recommended BOOLEAN NOT NULL DEFAULT FALSE,
  organic BOOLEAN NOT NULL DEFAULT FALSE,
  is_halal BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  maximum_cart_quantity INTEGER NOT NULL DEFAULT 0,
  added_by VARCHAR(50) DEFAULT 'admin',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  food_variations JSONB,
  images_url_full_path JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ ITEM CAMPAIGNS (per-item discounts) ============
CREATE TABLE IF NOT EXISTS item_campaigns (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  item_id BIGINT REFERENCES items(id) ON DELETE CASCADE,
  slug VARCHAR(255) UNIQUE,
  maximum_cart_quantity INTEGER NOT NULL DEFAULT 0,
  food_variations JSONB,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ TAGS ============
CREATE TABLE IF NOT EXISTS tags (
  id BIGSERIAL PRIMARY KEY,
  tag VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS item_tag (
  id BIGSERIAL PRIMARY KEY,
  item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(item_id, tag_id)
);

-- ============ CUSTOMER ADDRESSES ============
CREATE TABLE IF NOT EXISTS customer_addresses (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,  -- accepts either legacy users.id (bigint string) or auth.users.id (uuid)
  contact_person_name VARCHAR(255),
  contact_person_number VARCHAR(50),
  address_type address_type_enum NOT NULL DEFAULT 'delivery',
  address TEXT NOT NULL,
  floor VARCHAR(255),
  road VARCHAR(255),
  house VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(255),
  pincode VARCHAR(20),
  latitude VARCHAR(50),
  longitude VARCHAR(50),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_billing BOOLEAN NOT NULL DEFAULT FALSE,
  zone_id BIGINT REFERENCES zones(id) ON DELETE SET NULL,
  plus_code VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS customer_addresses_user_id_idx ON customer_addresses(user_id);

-- ============ DELIVERY MEN / RIDERS ============
CREATE TABLE IF NOT EXISTS d_m_vehicles (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  is_delivery BOOLEAN NOT NULL DEFAULT TRUE,
  is_ride BOOLEAN NOT NULL DEFAULT FALSE,
  starting_coverage_area NUMERIC(8,2) NOT NULL DEFAULT 0,
  maximum_coverage_area NUMERIC(8,2) NOT NULL DEFAULT 0,
  extra_charges NUMERIC(12,2) NOT NULL DEFAULT 0,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_men (
  id BIGSERIAL PRIMARY KEY,
  f_name VARCHAR(255),
  l_name VARCHAR(255),
  phone VARCHAR(50) UNIQUE,
  email VARCHAR(255) UNIQUE,
  identity_number VARCHAR(255),
  identity_type VARCHAR(50),
  identity_image TEXT,
  image TEXT,
  zone_id BIGINT REFERENCES zones(id) ON DELETE SET NULL,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT FALSE,
  earning NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_orders INTEGER NOT NULL DEFAULT 0,
  type VARCHAR(50) DEFAULT 'delivery_man',
  store_id BIGINT REFERENCES stores(id) ON DELETE SET NULL,
  application_status vendor_status NOT NULL DEFAULT 'pending',
  order_count INTEGER NOT NULL DEFAULT 0,
  vehicle_id BIGINT REFERENCES d_m_vehicles(id) ON DELETE SET NULL,
  loyalty_point NUMERIC(12,2) NOT NULL DEFAULT 0,
  ref_code VARCHAR(50) UNIQUE,
  ref_by BIGINT,
  is_delivery BOOLEAN NOT NULL DEFAULT TRUE,
  is_ride BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ VENDOR EMPLOYEES (legacy) ============
CREATE TABLE IF NOT EXISTS vendor_employees (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT REFERENCES vendors(id) ON DELETE CASCADE,
  f_name VARCHAR(255),
  l_name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  image TEXT,
  role VARCHAR(50) DEFAULT 'employee',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ BANNERS ============
CREATE TABLE IF NOT EXISTS banners (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type banner_type_enum NOT NULL DEFAULT 'app',
  image TEXT NOT NULL,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  data TEXT,
  zone_id BIGINT REFERENCES zones(id) ON DELETE SET NULL,
  module_id BIGINT REFERENCES modules(id) ON DELETE SET NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  default_link TEXT,
  created_by VARCHAR(50) DEFAULT 'admin',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  time_period VARCHAR(50),
  background_color VARCHAR(20),
  redirect_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ ADMIN / REACT PROMOTIONAL BANNERS ============
CREATE TABLE IF NOT EXISTS admin_promotional_banners (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  sub_title VARCHAR(255),
  image TEXT NOT NULL,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ COUPONS ============
CREATE TABLE IF NOT EXISTS coupons (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  start_date TIMESTAMPTZ,
  expire_date TIMESTAMPTZ,
  min_purchase NUMERIC(12,2) NOT NULL DEFAULT 0,
  max_discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_type discount_type_enum NOT NULL DEFAULT 'amount',
  coupon_type coupon_type_enum NOT NULL DEFAULT 'default',
  limit INTEGER NOT NULL DEFAULT 0,
  total_uses INTEGER NOT NULL DEFAULT 0,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  data JSONB,
  module_id BIGINT REFERENCES modules(id) ON DELETE SET NULL,
  created_by VARCHAR(50) DEFAULT 'admin',
  customer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  slug VARCHAR(255),
  store_id BIGINT REFERENCES stores(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ CAMPAIGNS ============
CREATE TABLE IF NOT EXISTS campaigns (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image TEXT,
  description TEXT,
  status campaign_status_enum NOT NULL DEFAULT 'running',
  admin_id BIGINT REFERENCES admins(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  module_id BIGINT REFERENCES modules(id) ON DELETE SET NULL,
  slug VARCHAR(255) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_store (
  id BIGSERIAL PRIMARY KEY,
  campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  campaign_status campaign_status_enum NOT NULL DEFAULT 'running',
  UNIQUE(campaign_id, store_id)
);

-- ============ FLASH SALES ============
CREATE TABLE IF NOT EXISTS flash_sales (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT REFERENCES modules(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  is_publish BOOLEAN NOT NULL DEFAULT FALSE,
  admin_discount_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  vendor_discount_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  slug VARCHAR(255) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flash_sale_items (
  id BIGSERIAL PRIMARY KEY,
  flash_sale_id BIGINT NOT NULL REFERENCES flash_sales(id) ON DELETE CASCADE,
  item_id BIGINT REFERENCES items(id) ON DELETE SET NULL,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ ORDERS ============
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_status order_status_type NOT NULL DEFAULT 'pending',
  payment_status payment_status_type NOT NULL DEFAULT 'unpaid',
  payment_method payment_method_type NOT NULL DEFAULT 'cash_on_delivery',
  transaction_reference VARCHAR(255),
  order_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  order_type order_type_enum NOT NULL DEFAULT 'delivery',
  user_id VARCHAR(255) NOT NULL,  -- accepts bigint (legacy users.id) or uuid (auth.users.id)
  store_id BIGINT REFERENCES stores(id) ON DELETE SET NULL,
  delivery_man_id BIGINT REFERENCES delivery_men(id) ON DELETE SET NULL,
  delivery_address TEXT,
  delivery_address_id BIGINT REFERENCES customer_addresses(id) ON DELETE SET NULL,
  coupon_code VARCHAR(100),
  coupon_discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  distance NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_method VARCHAR(50),
  schedule_at TIMESTAMPTZ,
  accepted BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  processing BOOLEAN NOT NULL DEFAULT FALSE,
  handover BOOLEAN NOT NULL DEFAULT FALSE,
  picked_up BOOLEAN NOT NULL DEFAULT FALSE,
  delivered BOOLEAN NOT NULL DEFAULT FALSE,
  canceled BOOLEAN NOT NULL DEFAULT FALSE,
  refund_request_canceled BOOLEAN NOT NULL DEFAULT FALSE,
  refund_request BOOLEAN NOT NULL DEFAULT FALSE,
  refunded BOOLEAN NOT NULL DEFAULT FALSE,
  dm_tips NUMERIC(12,2) NOT NULL DEFAULT 0,
  dm_vehicle_id BIGINT,
  zone_id BIGINT REFERENCES zones(id) ON DELETE SET NULL,
  module_id BIGINT REFERENCES modules(id) ON DELETE SET NULL,
  is_cutlery BOOLEAN NOT NULL DEFAULT FALSE,
  cutlery_charge NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_dm_assign BOOLEAN NOT NULL DEFAULT FALSE,
  additional_charge NUMERIC(12,2) NOT NULL DEFAULT 0,
  flash_admin_discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  flash_store_discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_partial BOOLEAN NOT NULL DEFAULT FALSE,
  cash_received_by BIGINT,
  prescription_order BOOLEAN NOT NULL DEFAULT FALSE,
  is_guest BOOLEAN NOT NULL DEFAULT FALSE,
  cash_back_id BIGINT,
  extra_packaging_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  ref_bonus_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  free_delivery_by VARCHAR(50),
  cancellation_reason TEXT,
  canceled_by VARCHAR(50),
  coupon_created_by VARCHAR(50),
  discount_on_product_by VARCHAR(50),
  processing_time TIMESTAMPTZ,
  unavailable_item_note TEXT,
  cutlery BOOLEAN NOT NULL DEFAULT FALSE,
  delivery_instruction TEXT,
  tax_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  tax_status VARCHAR(50) DEFAULT 'included',
  tax_type tax_type_enum NOT NULL DEFAULT 'include',
  order_proof TEXT,
  order_attachment TEXT,
  partially_paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  schedule_id BIGINT,
  pending BOOLEAN NOT NULL DEFAULT FALSE,
  bring_change_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  cancellation_note TEXT,
  delivery_type VARCHAR(50),
  delivery_type_charge NUMERIC(12,2) NOT NULL DEFAULT 0,
  extra_discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  edited BOOLEAN NOT NULL DEFAULT FALSE,
  adjusment NUMERIC(12,2) NOT NULL DEFAULT 0,
  order_code VARCHAR(50) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_store_id_idx ON orders(store_id);

-- ============ ORDER DETAILS (line items) ============
CREATE TABLE IF NOT EXISTS order_details (
  id BIGSERIAL PRIMARY KEY,
  item_id BIGINT REFERENCES items(id) ON DELETE SET NULL,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  item_details JSONB,
  variation JSONB,
  add_ons JSONB,
  discount_on_item NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_type discount_type_enum NOT NULL DEFAULT 'amount',
  quantity INTEGER NOT NULL DEFAULT 1,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  variant JSONB,
  item_campaign_id BIGINT,
  total_add_on_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  category_id BIGINT,
  discount_on_product_by VARCHAR(50),
  tax_status VARCHAR(50),
  discount_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  addon_discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ ORDER TRANSACTIONS ============
CREATE TABLE IF NOT EXISTS order_transactions (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  dm_tips NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_fee_comission NUMERIC(12,2) NOT NULL DEFAULT 0,
  admin_expense NUMERIC(12,2) NOT NULL DEFAULT 0,
  store_expense NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount_by_store NUMERIC(12,2) NOT NULL DEFAULT 0,
  additional_charge NUMERIC(12,2) NOT NULL DEFAULT 0,
  extra_packaging_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  ref_bonus_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_subscribed BOOLEAN NOT NULL DEFAULT FALSE,
  pro_discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  pro_delivery_discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  subscription_model VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ ORDER PAYMENTS ============
CREATE TABLE IF NOT EXISTS order_payments (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_status payment_status_type NOT NULL DEFAULT 'unpaid',
  payment_method payment_method_type NOT NULL DEFAULT 'cash_on_delivery',
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  transaction_reference VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method payment_method_type NOT NULL DEFAULT 'cash_on_delivery',
  transaction_reference VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_requests (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  gateway VARCHAR(50) NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  payment_intent_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ WISHLISTS (favorites) ============
CREATE TABLE IF NOT EXISTS wishlists (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  item_id BIGINT REFERENCES items(id) ON DELETE CASCADE,
  store_id BIGINT REFERENCES stores(id) ON DELETE CASCADE,
  is_item BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS wishlists_user_id_idx ON wishlists(user_id);

-- ============ CARTS ============
CREATE TABLE IF NOT EXISTS carts (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  store_id BIGINT REFERENCES stores(id) ON DELETE CASCADE,
  cart_group_id VARCHAR(255),
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  variation JSONB,
  add_ons JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS carts_user_id_idx ON carts(user_id);

-- ============ REVIEWS ============
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  item_id BIGINT REFERENCES items(id) ON DELETE CASCADE,
  store_id BIGINT REFERENCES stores(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL DEFAULT 5,
  comment TEXT,
  reply TEXT,
  replied_at TIMESTAMPTZ,
  review_id BIGINT,
  is_seen BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ WALLET TRANSACTIONS ============
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  transaction_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  credit NUMERIC(12,2) NOT NULL DEFAULT 0,
  debit NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  reference VARCHAR(255),
  transaction_type VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_payments (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  payment_id VARCHAR(255),
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_bonuses (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  reason VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ LOYALTY POINT TRANSACTIONS ============
CREATE TABLE IF NOT EXISTS loyalty_point_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  transaction_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  credit NUMERIC(12,2) NOT NULL DEFAULT 0,
  debit NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  reference VARCHAR(255),
  transaction_type VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ REFUNDS ============
CREATE TABLE IF NOT EXISTS refunds (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  refund_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  refund_status VARCHAR(50) DEFAULT 'pending',
  refund_method VARCHAR(50),
  customer_reason TEXT,
  customer_note TEXT,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refund_reasons (
  id BIGSERIAL PRIMARY KEY,
  reason VARCHAR(255) NOT NULL,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ WITHDRAW REQUESTS ============
CREATE TABLE IF NOT EXISTS withdraw_requests (
  id BIGSERIAL PRIMARY KEY,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_man_id BIGINT REFERENCES delivery_men(id) ON DELETE CASCADE,
  vendor_id BIGINT REFERENCES vendors(id) ON DELETE CASCADE,
  withdrawal_method_id BIGINT,
  withdrawal_method_fields JSONB,
  type VARCHAR(50) DEFAULT 'vendor',
  sender_note TEXT,
  user_note TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS withdrawal_methods (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  fields JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ DISBURSEMENTS ============
CREATE TABLE IF NOT EXISTS disbursements (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  disbursement_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS user_notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  data JSONB,
  is_seen BOOLEAN NOT NULL DEFAULT FALSE,
  notification_type VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ MESSAGES / CONVERSATIONS ============
CREATE TABLE IF NOT EXISTS conversations (
  id BIGSERIAL PRIMARY KEY,
  sender_id VARCHAR(255) NOT NULL,
  sender_type VARCHAR(50) NOT NULL,
  receiver_id VARCHAR(255) NOT NULL,
  receiver_type VARCHAR(50) NOT NULL,
  last_message_id BIGINT,
  unread_message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id VARCHAR(255) NOT NULL,
  message TEXT,
  file TEXT,
  is_seen BOOLEAN NOT NULL DEFAULT FALSE,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  question_for VARCHAR(50),
  question TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ STORAGE BUCKETS ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- RLS POLICIES — Required for the customer app to talk to Supabase
-- =====================================================================
-- Enable RLS on customer-facing tables. Public read for catalog tables;
-- owner-only CRUD for personal data. "Owner" is matched via
-- auth.uid() = user_id where user_id is the auth.users UUID,
-- OR auth.uid()::text = (SELECT user_id FROM users WHERE id = ...) for
-- customers that also have a legacy bigint users.id row.
-- =====================================================================

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Public read for catalog tables (uses anon key)
CREATE POLICY "public_read_modules" ON modules FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_zones" ON zones FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_brands" ON brands FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_units" ON units FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_stores" ON stores FOR SELECT TO anon, authenticated USING (status = true);
CREATE POLICY "public_read_store_categories" ON store_categories FOR SELECT TO anon, authenticated USING (status = true);
CREATE POLICY "public_read_items" ON items FOR SELECT TO anon, authenticated USING (status = true);
CREATE POLICY "public_read_add_ons" ON add_ons FOR SELECT TO anon, authenticated USING (status = true);
CREATE POLICY "public_read_banners" ON banners FOR SELECT TO anon, authenticated USING (status = true);
CREATE POLICY "public_read_coupons" ON coupons FOR SELECT TO anon, authenticated USING (status = true);
CREATE POLICY "public_read_campaigns" ON campaigns FOR SELECT TO anon, authenticated USING (status = 'running');
CREATE POLICY "public_read_flash_sales" ON flash_sales FOR SELECT TO anon, authenticated USING (is_publish = true);

-- Owner-only CRUD for personal tables (auth.uid = user_id, both as text)
CREATE POLICY "owner_read_addresses" ON customer_addresses FOR SELECT TO authenticated USING (user_id = auth.uid()::text);
CREATE POLICY "owner_insert_addresses" ON customer_addresses FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "owner_update_addresses" ON customer_addresses FOR UPDATE TO authenticated USING (user_id = auth.uid()::text) WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "owner_delete_addresses" ON customer_addresses FOR DELETE TO authenticated USING (user_id = auth.uid()::text);

CREATE POLICY "owner_read_carts" ON carts FOR SELECT TO authenticated USING (user_id = auth.uid()::text);
CREATE POLICY "owner_insert_carts" ON carts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "owner_update_carts" ON carts FOR UPDATE TO authenticated USING (user_id = auth.uid()::text) WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "owner_delete_carts" ON carts FOR DELETE TO authenticated USING (user_id = auth.uid()::text);

CREATE POLICY "owner_read_wishlists" ON wishlists FOR SELECT TO authenticated USING (user_id = auth.uid()::text);
CREATE POLICY "owner_insert_wishlists" ON wishlists FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "owner_delete_wishlists" ON wishlists FOR DELETE TO authenticated USING (user_id = auth.uid()::text);

CREATE POLICY "owner_read_orders" ON orders FOR SELECT TO authenticated USING (user_id = auth.uid()::text);
CREATE POLICY "owner_insert_orders" ON orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "owner_update_orders" ON orders FOR UPDATE TO authenticated USING (user_id = auth.uid()::text) WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "owner_read_order_details" ON order_details FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM orders o WHERE o.id = order_details.order_id AND o.user_id = auth.uid()::text)
);
CREATE POLICY "owner_insert_order_details" ON order_details FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM orders o WHERE o.id = order_details.order_id AND o.user_id = auth.uid()::text)
);

CREATE POLICY "owner_read_reviews" ON reviews FOR SELECT TO authenticated USING (user_id = auth.uid()::text OR item_id IS NOT NULL);
CREATE POLICY "owner_insert_reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "owner_read_wallet" ON wallet_transactions FOR SELECT TO authenticated USING (user_id = auth.uid()::text);
CREATE POLICY "owner_read_loyalty" ON loyalty_point_transactions FOR SELECT TO authenticated USING (user_id = auth.uid()::text);

CREATE POLICY "owner_read_notifications" ON user_notifications FOR SELECT TO authenticated USING (user_id = auth.uid()::text);
CREATE POLICY "owner_update_notifications" ON user_notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()::text);

CREATE POLICY "owner_read_user_profiles" ON user_profiles FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_active = true);
CREATE POLICY "owner_update_user_profiles" ON user_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Allow users to insert their own profile row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, role, is_active)
  VALUES (NEW.id, 'customer', FALSE)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- DELIVERY MAN access policies
-- The delivery app authenticates as auth.users and reads/writes orders
-- assigned to them via the legacy bigint `delivery_men.id` FK.
-- We need a helper to look up the delivery_men.id from auth.uid().
-- =====================================================================
CREATE OR REPLACE FUNCTION public.current_delivery_man_id()
RETURNS BIGINT AS $$
  SELECT id FROM public.delivery_men WHERE email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ) LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "dm_read_own_orders" ON orders FOR SELECT TO authenticated USING (
  delivery_man_id IS NOT NULL
  AND delivery_man_id = public.current_delivery_man_id()
);
CREATE POLICY "dm_update_own_orders" ON orders FOR UPDATE TO authenticated USING (
  delivery_man_id IS NOT NULL
  AND delivery_man_id = public.current_delivery_man_id()
) WITH CHECK (
  delivery_man_id IS NOT NULL
  AND delivery_man_id = public.current_delivery_man_id()
);

CREATE POLICY "dm_read_own_order_details" ON order_details FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_details.order_id
      AND o.delivery_man_id = public.current_delivery_man_id()
  )
);

-- Delivery men can read stores + items + users (for the orders assigned to them)
CREATE POLICY "dm_read_stores" ON stores FOR SELECT TO authenticated USING (status = true);
CREATE POLICY "dm_read_items" ON items FOR SELECT TO authenticated USING (status = true);
CREATE POLICY "dm_read_users_for_orders" ON users FOR SELECT TO authenticated USING (is_active = true);

-- Delivery men can update their own profile row (delivery_men table)
CREATE POLICY "dm_read_self" ON delivery_men FOR SELECT TO authenticated USING (true);
CREATE POLICY "dm_update_self" ON delivery_men FOR UPDATE TO authenticated USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
) WITH CHECK (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- =====================================================================
-- VENDOR access policies
-- The vendor app authenticates as auth.users and looks up the vendors row
-- by email. Stores, items, orders, etc. are scoped via the vendor's id.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.current_vendor_id()
RETURNS BIGINT AS $$
  SELECT id FROM public.vendors WHERE email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ) LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Vendors can read/update their own vendors row
CREATE POLICY "vendor_read_self" ON vendors FOR SELECT TO authenticated USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);
CREATE POLICY "vendor_update_self" ON vendors FOR UPDATE TO authenticated USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
) WITH CHECK (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Vendors can read/update stores they own
CREATE POLICY "vendor_read_own_stores" ON stores FOR SELECT TO authenticated USING (
  vendor_id = public.current_vendor_id()
);
CREATE POLICY "vendor_update_own_stores" ON stores FOR UPDATE TO authenticated USING (
  vendor_id = public.current_vendor_id()
) WITH CHECK (
  vendor_id = public.current_vendor_id()
);

-- Vendors can read/write store_categories for their stores
CREATE POLICY "vendor_rw_store_categories" ON store_categories FOR ALL TO authenticated USING (
  store_id IN (SELECT id FROM stores WHERE vendor_id = public.current_vendor_id())
) WITH CHECK (
  store_id IN (SELECT id FROM stores WHERE vendor_id = public.current_vendor_id())
);

-- Vendors can read/write items for their stores
CREATE POLICY "vendor_read_own_items" ON items FOR SELECT TO authenticated USING (
  store_id IN (SELECT id FROM stores WHERE vendor_id = public.current_vendor_id())
);
CREATE POLICY "vendor_insert_own_items" ON items FOR INSERT TO authenticated WITH CHECK (
  store_id IN (SELECT id FROM stores WHERE vendor_id = public.current_vendor_id())
);
CREATE POLICY "vendor_update_own_items" ON items FOR UPDATE TO authenticated USING (
  store_id IN (SELECT id FROM stores WHERE vendor_id = public.current_vendor_id())
) WITH CHECK (
  store_id IN (SELECT id FROM stores WHERE vendor_id = public.current_vendor_id())
);
CREATE POLICY "vendor_delete_own_items" ON items FOR DELETE TO authenticated USING (
  store_id IN (SELECT id FROM stores WHERE vendor_id = public.current_vendor_id())
);

-- Vendors can read + update orders for their stores (e.g. accept/cancel status)
CREATE POLICY "vendor_read_own_orders" ON orders FOR SELECT TO authenticated USING (
  store_id IN (SELECT id FROM stores WHERE vendor_id = public.current_vendor_id())
);
CREATE POLICY "vendor_update_own_orders" ON orders FOR UPDATE TO authenticated USING (
  store_id IN (SELECT id FROM stores WHERE vendor_id = public.current_vendor_id())
) WITH CHECK (
  store_id IN (SELECT id FROM stores WHERE vendor_id = public.current_vendor_id())
);

-- Vendors can read order_details for their stores' orders
CREATE POLICY "vendor_read_own_order_details" ON order_details FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN stores s ON s.id = o.store_id
    WHERE o.id = order_details.order_id
      AND s.vendor_id = public.current_vendor_id()
  )
);

-- Vendors can read/write coupons for their stores
CREATE POLICY "vendor_rw_own_coupons" ON coupons FOR ALL TO authenticated USING (
  store_id IN (SELECT id FROM stores WHERE vendor_id = public.current_vendor_id())
) WITH CHECK (
  store_id IN (SELECT id FROM stores WHERE vendor_id = public.current_vendor_id())
);

-- Vendors can read/write campaign_store join for their stores
CREATE POLICY "vendor_rw_campaign_store" ON campaign_store FOR ALL TO authenticated USING (
  store_id IN (SELECT id FROM stores WHERE vendor_id = public.current_vendor_id())
) WITH CHECK (
  store_id IN (SELECT id FROM stores WHERE vendor_id = public.current_vendor_id())
);

-- Vendors can read/write delivery_men assigned to their stores
CREATE POLICY "vendor_rw_own_delivery_men" ON delivery_men FOR ALL TO authenticated USING (
  store_id IN (SELECT id FROM stores WHERE vendor_id = public.current_vendor_id())
) WITH CHECK (
  store_id IN (SELECT id FROM stores WHERE vendor_id = public.current_vendor_id())
);

-- Vendors can read disbursements for their stores
CREATE POLICY "vendor_read_own_disbursements" ON disbursements FOR SELECT TO authenticated USING (
  store_id IN (SELECT id FROM stores WHERE vendor_id = public.current_vendor_id())
);

-- Vendors can read/write conversations where they're a participant
-- (sender_id or receiver_id matches the vendor's stores.id)
CREATE POLICY "vendor_rw_conversations" ON conversations FOR ALL TO authenticated USING (
  sender_id::text IN (SELECT id::text FROM stores WHERE vendor_id = public.current_vendor_id())
  OR receiver_id::text IN (SELECT id::text FROM stores WHERE vendor_id = public.current_vendor_id())
) WITH CHECK (
  sender_id::text IN (SELECT id::text FROM stores WHERE vendor_id = public.current_vendor_id())
  OR receiver_id::text IN (SELECT id::text FROM stores WHERE vendor_id = public.current_vendor_id())
);

-- Vendors can read messages in their conversations
CREATE POLICY "vendor_read_messages" ON messages FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
      AND (
        c.sender_id::text IN (SELECT id::text FROM stores WHERE vendor_id = public.current_vendor_id())
        OR c.receiver_id::text IN (SELECT id::text FROM stores WHERE vendor_id = public.current_vendor_id())
      )
  )
);
CREATE POLICY "vendor_insert_messages" ON messages FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
      AND (
        c.sender_id::text IN (SELECT id::text FROM stores WHERE vendor_id = public.current_vendor_id())
        OR c.receiver_id::text IN (SELECT id::text FROM stores WHERE vendor_id = public.current_vendor_id())
      )
  )
);

-- Vendors can read/insert withdraw_requests for themselves
CREATE POLICY "vendor_rw_own_withdraw_requests" ON withdraw_requests FOR ALL TO authenticated USING (
  vendor_id = public.current_vendor_id()
) WITH CHECK (
  vendor_id = public.current_vendor_id()
);

-- Vendors can read withdrawal_methods (global, read-only)
ALTER TABLE withdrawal_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendor_read_withdrawal_methods" ON withdrawal_methods FOR SELECT TO authenticated USING (is_active = true);

-- Vendors can read banners + campaigns + add_ons + categories + brands + units + modules (all public read)
-- These already have public_read_* policies from the customer-facing section above; nothing extra needed.

-- Vendors can read/write user_notifications addressed to their auth user id
CREATE POLICY "vendor_read_own_notifications" ON user_notifications FOR SELECT TO authenticated USING (
  user_id = auth.uid()::text
);
CREATE POLICY "vendor_update_own_notifications" ON user_notifications FOR UPDATE TO authenticated USING (
  user_id = auth.uid()::text
) WITH CHECK (
  user_id = auth.uid()::text
);

-- Vendors can read/write wallet_transactions addressed to their auth user id
CREATE POLICY "vendor_rw_own_wallet" ON wallet_transactions FOR ALL TO authenticated USING (
  user_id = auth.uid()::text
) WITH CHECK (
  user_id = auth.uid()::text
);

-- Vendors can read/write loyalty_point_transactions addressed to their auth user id
CREATE POLICY "vendor_rw_own_loyalty" ON loyalty_point_transactions FOR ALL TO authenticated USING (
  user_id = auth.uid()::text
) WITH CHECK (
  user_id = auth.uid()::text
);

-- ===== END base_schema.sql =====

-- ===== BEGIN init.sql =====
-- =================================================================
-- 6amMart Admin Panel - Supabase Schema (Combined Init)
-- Auto-generated from 275 Laravel migrations
-- Run this in Supabase SQL Editor to initialize the full schema.
-- =================================================================

BEGIN;

-- ===========================================================
-- File: 0000_00_00_000000_create_websockets_statistics_entries_table.sql
-- ===========================================================
-- Converted from Laravel migration: 0000_00_00_000000_create_websockets_statistics_entries_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "websockets_statistics_entries" (
  "id" serial NOT NULL,
  "app_id" varchar(255) NOT NULL,
  "peak_connection_count" integer NOT NULL,
  "websocket_message_count" integer NOT NULL,
  "api_message_count" integer NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2016_06_01_000001_create_oauth_auth_codes_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2016_06_01_000001_create_oauth_auth_codes_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "oauth_auth_codes" (
  "id" varchar(255) NOT NULL,
  "user_id" bigint NOT NULL,
  "client_id" bigint NOT NULL,
  "scopes" text NULL,
  "revoked" boolean NOT NULL,
  "expires_at" timestamp NULL
);


-- ===========================================================
-- File: 2016_06_01_000002_create_oauth_access_tokens_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2016_06_01_000002_create_oauth_access_tokens_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "oauth_access_tokens" (
  "id" varchar(255) NOT NULL,
  "user_id" bigint NULL,
  "client_id" bigint NOT NULL,
  "name" varchar(255) NULL,
  "scopes" text NULL,
  "revoked" boolean NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" timestamp NULL
);


-- ===========================================================
-- File: 2016_06_01_000003_create_oauth_refresh_tokens_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2016_06_01_000003_create_oauth_refresh_tokens_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "oauth_refresh_tokens" (
  "id" varchar(255) NOT NULL,
  "access_token_id" varchar(255) NOT NULL,
  "revoked" boolean NOT NULL,
  "expires_at" timestamp NULL
);


-- ===========================================================
-- File: 2016_06_01_000004_create_oauth_clients_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2016_06_01_000004_create_oauth_clients_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "oauth_clients" (
  "id" bigserial NOT NULL,
  "user_id" bigint NULL,
  "name" varchar(255) NOT NULL,
  "secret" varchar(255) NULL,
  "provider" varchar(255) NULL,
  "redirect" text NOT NULL,
  "personal_access_client" boolean NOT NULL,
  "password_client" boolean NOT NULL,
  "revoked" boolean NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2016_06_01_000005_create_oauth_personal_access_clients_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2016_06_01_000005_create_oauth_personal_access_clients_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "oauth_personal_access_clients" (
  "id" bigserial NOT NULL,
  "client_id" bigint NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2022_03_31_103418_create_wallet_transactions_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_03_31_103418_create_wallet_transactions_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "wallet_transactions" (
  "id" bigserial PRIMARY KEY,
  "user_id" bigint NULL,
  "transaction_id" uuid NOT NULL,
  "credit" numeric('credit',24) NOT NULL DEFAULT 0,
  "debit" numeric('debit',24) NOT NULL DEFAULT 0,
  "admin_bonus" numeric('admin_bonus',24) NOT NULL DEFAULT 0,
  "balance" numeric('balance',24) NOT NULL DEFAULT 0,
  "transaction_type" varchar(255) NULL,
  "reference" varchar(255) NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2022_03_31_103827_create_loyalty_point_transactions_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_03_31_103827_create_loyalty_point_transactions_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "loyalty_point_transactions" (
  "id" bigserial PRIMARY KEY,
  "user_id" bigint NULL,
  "transaction_id" uuid NOT NULL,
  "credit" numeric('credit',24) NOT NULL DEFAULT 0,
  "debit" numeric('debit',24) NOT NULL DEFAULT 0,
  "balance" numeric('balance',24) NOT NULL DEFAULT 0,
  "reference" varchar(255) NULL,
  "transaction_type" varchar(255) NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2022_04_09_161150_add_wallet_point_columns_to_users_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_04_09_161150_add_wallet_point_columns_to_users_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "users" ADD COLUMN "wallet_balance" numeric('wallet_balance',24) NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "loyalty_point" numeric('loyalty_point',24) NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2022_04_10_030533_create_newsletters_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_04_10_030533_create_newsletters_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "newsletters" (
  "id" bigserial PRIMARY KEY,
  "email" varchar(255) NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2022_04_12_015827_create_social_media_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_04_12_015827_create_social_media_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "social_media" (
  "id" bigserial PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "link" varchar(255) NOT NULL,
  "status" boolean NOT NULL DEFAULT TRUE,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2022_04_12_215009_create_jobs_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_04_12_215009_create_jobs_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "jobs" (
  "id" bigserial NOT NULL,
  "queue" varchar(255) NOT NULL,
  "payload" text NOT NULL,
  "attempts" smallint NOT NULL,
  "reserved_at" integer NULL,
  "available_at" integer NOT NULL,
  "created_at" integer NOT NULL
);


-- ===========================================================
-- File: 2022_04_21_145207_add_column_to_modules_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_04_21_145207_add_column_to_modules_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "modules" ADD COLUMN "icon" varchar(255) NULL;
ALTER TABLE "modules" ADD COLUMN "theme_id" integer NOT NULL DEFAULT 1;
ALTER TABLE "modules" ADD COLUMN "description" text NULL;


-- ===========================================================
-- File: 2022_05_12_170027_add_column_to_customer_addresses_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_05_12_170027_add_column_to_customer_addresses_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "customer_addresses" ADD COLUMN "floor" varchar(255) NULL;
ALTER TABLE "customer_addresses" ADD COLUMN "road" varchar(255) NULL;
ALTER TABLE "customer_addresses" ADD COLUMN "house" varchar(255) NULL;


-- ===========================================================
-- File: 2022_05_14_122133_add_dm_tips_column_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_05_14_122133_add_dm_tips_column_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "dm_tips" numeric('dm_tips',24) NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2022_05_14_122603_add_dm_tips_column_to_order_transactions_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_05_14_122603_add_dm_tips_column_to_order_transactions_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "order_transactions" ADD COLUMN "dm_tips" numeric('dm_tips',24) NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2022_05_14_155444_add_all_zones_column_to_modules_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_05_14_155444_add_all_zones_column_to_modules_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "modules" ADD COLUMN "all_zone_service" boolean NOT NULL DEFAULT FALSE;


-- ===========================================================
-- File: 2022_05_17_153333_add_ref_code_to_users_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_05_17_153333_add_ref_code_to_users_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "users" ADD COLUMN "ref_code" varchar(255) NULL;


-- ===========================================================
-- File: 2022_05_26_120821_change_data_column_to_user_notifiations_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_05_26_120821_change_data_column_to_user_notifiations_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "user_notifications" ADD COLUMN "data" text NOT NULL;


-- ===========================================================
-- File: 2022_07_31_103626_add_free_delivery_by_column_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_07_31_103626_add_free_delivery_by_column_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "free_delivery_by" varchar(255) NULL;


-- ===========================================================
-- File: 2022_09_10_112137_create_user_infos_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_09_10_112137_create_user_infos_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "user_infos" (
  "id" bigserial PRIMARY KEY,
  "f_name" varchar(255) NULL,
  "l_name" varchar(255) NULL,
  "phone" varchar(255) NULL,
  "email" varchar(255) NULL,
  "image" varchar(255) NULL,
  "admin_id" bigint NULL,
  "user_id" bigint NULL,
  "vendor_id" bigint NULL,
  "deliveryman_id" bigint NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2022_09_10_112203_create_conversations_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_09_10_112203_create_conversations_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "conversations" (
  "id" bigserial PRIMARY KEY,
  "sender_id" bigint NOT NULL,
  "sender_type" varchar(255) NOT NULL,
  "receiver_id" bigint NOT NULL,
  "receiver_type" varchar(255) NOT NULL,
  "last_message_id" bigint NULL,
  "last_message_time" timestamp NULL,
  "unread_message_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2022_09_10_112220_create_messages_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_09_10_112220_create_messages_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "messages" (
  "id" bigserial PRIMARY KEY,
  "conversation_id" bigint NULL,
  "sender_id" bigint NULL,
  "message" text NULL,
  "file" varchar(255) NULL,
  "is_seen" boolean NOT NULL DEFAULT 0,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2022_10_18_092639_create_refunds_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_10_18_092639_create_refunds_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "refunds" (
  "id" bigserial PRIMARY KEY,
  "order_id" bigint NOT NULL,
  "user_id" bigint NOT NULL,
  "order_status" varchar(255) NOT NULL,
  "image" varchar(255) NULL,
  "customer_reason" varchar(255) NULL,
  "customer_note" text NULL,
  "admin_note" text NULL,
  "refund_amount" numeric NOT NULL DEFAULT 0,
  "refund_status" varchar(255) NOT NULL,
  "refund_method" varchar(255) NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2022_10_18_093323_add_refund_request_cancel_column_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_10_18_093323_add_refund_request_cancel_column_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "refund_request_canceled" timestamp NULL;


-- ===========================================================
-- File: 2022_10_18_093529_create_refund_reasons_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_10_18_093529_create_refund_reasons_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "refund_reasons" (
  "id" bigserial PRIMARY KEY,
  "reason" varchar(255) NOT NULL,
  "status" boolean NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2022_10_19_150319_add_delivery_column_to_parcel_categories_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_10_19_150319_add_delivery_column_to_parcel_categories_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "parcel_categories" ADD COLUMN "parcel_per_km_shipping_charge" numeric('parcel_per_km_shipping_charge',23) NULL;
ALTER TABLE "parcel_categories" ADD COLUMN "parcel_minimum_shipping_charge" numeric('parcel_minimum_shipping_charge',23) NULL;


-- ===========================================================
-- File: 2022_10_19_165501_add_default_link_column_to_banners_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_10_19_165501_add_default_link_column_to_banners_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "banners" ADD COLUMN "default_link" varchar(255) NULL;


-- ===========================================================
-- File: 2022_10_20_105050_module_zone.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_10_20_105050_module_zone.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "module_zone" (
  "id" bigserial PRIMARY KEY,
  "module_id" bigint NOT NULL,
  "zone_id" bigint NOT NULL,
  "per_km_shipping_charge" numeric('per_km_shipping_charge',23) NULL,
  "minimum_shipping_charge" numeric('minimum_shipping_charge',23) NULL
);


-- ===========================================================
-- File: 2022_10_22_115553_add_is_logged_column_to_admins_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_10_22_115553_add_is_logged_column_to_admins_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "admins" ADD COLUMN "is_logged_in" boolean NOT NULL DEFAULT TRUE;


-- ===========================================================
-- File: 2022_10_22_122336_add_is_logged_column_to_vendor_employees_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_10_22_122336_add_is_logged_column_to_vendor_employees_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "vendor_employees" ADD COLUMN "is_logged_in" boolean NOT NULL DEFAULT TRUE;


-- ===========================================================
-- File: 2022_10_25_153214_add_payment_method_columns_to_zones_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_10_25_153214_add_payment_method_columns_to_zones_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "zones" ADD COLUMN "cash_on_delivery" boolean NOT NULL DEFAULT FALSE;
ALTER TABLE "zones" ADD COLUMN "digital_payment" boolean NOT NULL DEFAULT FALSE;


-- ===========================================================
-- File: 2022_10_31_165427_add_rename_delivery_charge_column_to_stores_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_10_31_165427_add_rename_delivery_charge_column_to_stores_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "stores" ADD COLUMN "per_km_shipping_charge" numeric('per_km_shipping_charge',16) NOT NULL DEFAULT '0';


-- ===========================================================
-- File: 2022_11_05_094404_add_delivery_fee_comission_to_order_transactions_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_11_05_094404_add_delivery_fee_comission_to_order_transactions_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "order_transactions" ADD COLUMN "delivery_fee_comission" numeric('delivery_fee_comission',24) NOT NULL DEFAULT '0';


-- ===========================================================
-- File: 2022_11_13_130054_create_contacts_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_11_13_130054_create_contacts_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "contacts" (
  "id" bigserial PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL,
  "subject" text NOT NULL,
  "message" text NOT NULL,
  "seen" smallint NOT NULL DEFAULT 0,
  "feedback" varchar(255) NOT NULL DEFAULT 0,
  "reply" text NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2022_11_15_111925_create_expenses_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_11_15_111925_create_expenses_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "expenses" (
  "id" bigserial PRIMARY KEY,
  "type" varchar(255) NOT NULL DEFAULT 'custom',
  "amount" numeric NOT NULL,
  "description" text NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2022_11_15_112413_add_expense_column_to_order_transactions_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_11_15_112413_add_expense_column_to_order_transactions_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "order_transactions" ADD COLUMN "admin_expense" numeric('admin_expense',23) NULL DEFAULT 0;


-- ===========================================================
-- File: 2022_12_20_104455_add_food_variations_column_to_items_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_12_20_104455_add_food_variations_column_to_items_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "items" ADD COLUMN "food_variations" text NULL;


-- ===========================================================
-- File: 2022_12_21_154227_alter_table_order_details_change_variation.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_12_21_154227_alter_table_order_details_change_variation.php
-- Auto-generated. Review before running on production.

ALTER TABLE "order_details" ADD COLUMN "variation" text NOT NULL;


-- ===========================================================
-- File: 2022_12_29_103803_add_order_id_column_to_expenses_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_12_29_103803_add_order_id_column_to_expenses_table.php
-- Auto-generated. Review before running on production.




-- ===========================================================
-- File: 2022_12_29_105321_add_maximum_cod_order_amount_column_to_module_zone_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_12_29_105321_add_maximum_cod_order_amount_column_to_module_zone_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "module_zone" ADD COLUMN "maximum_cod_order_amount" numeric('maximum_cod_order_amount',23) NULL;


-- ===========================================================
-- File: 2022_12_29_114005_add_prescription_order_column_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_12_29_114005_add_prescription_order_column_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "prescription_order" boolean NOT NULL DEFAULT FALSE;


-- ===========================================================
-- File: 2022_12_31_111437_create_notification_messages_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2022_12_31_111437_create_notification_messages_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "notification_messages" (
  "id" bigserial PRIMARY KEY,
  "module_type" varchar(255) NULL,
  "key" varchar(255) NULL,
  "message" text NULL,
  "status" boolean NOT NULL DEFAULT TRUE,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_01_02_112948_create_tags_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_01_02_112948_create_tags_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "tags" (
  "id" bigserial PRIMARY KEY,
  "tag" varchar(255) NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_01_02_113235_item_tag.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_01_02_113235_item_tag.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "item_tag" (
  "id" bigserial PRIMARY KEY,
  "item_id" bigint NOT NULL,
  "tag_id" bigint NOT NULL
);


-- ===========================================================
-- File: 2023_01_03_093510_add_current_language_key_column_to_users_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_01_03_093510_add_current_language_key_column_to_users_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "users" ADD COLUMN "current_language_key" varchar(255) NULL DEFAULT 'en';


-- ===========================================================
-- File: 2023_01_07_115354_add_prescription_order_to_stores_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_01_07_115354_add_prescription_order_to_stores_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "stores" ADD COLUMN "prescription_order" boolean NOT NULL DEFAULT FALSE;


-- ===========================================================
-- File: 2023_01_07_180000_add_description_to_expenses_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_01_07_180000_add_description_to_expenses_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "expenses" ADD COLUMN "description" text NULL;
ALTER TABLE "expenses" ADD COLUMN "order_id" bigint NULL;


-- ===========================================================
-- File: 2023_01_10_124723_add_food_variations_column_to_item_campaigns_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_01_10_124723_add_food_variations_column_to_item_campaigns_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "item_campaigns" ADD COLUMN "food_variations" text NULL;


-- ===========================================================
-- File: 2023_01_10_145928_change_refund_amount_column_type.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_01_10_145928_change_refund_amount_column_type.php
-- Auto-generated. Review before running on production.

ALTER TABLE "refunds" ADD COLUMN "refund_amount" numeric('refund_amount',23) NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2023_01_10_150108_change_amount_column_type.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_01_10_150108_change_amount_column_type.php
-- Auto-generated. Review before running on production.

ALTER TABLE "withdraw_requests" ADD COLUMN "amount" numeric('amount',23) NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2023_01_23_103943_add_slug_to_items_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_01_23_103943_add_slug_to_items_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "items" ADD COLUMN "slug" varchar(255) NULL;


-- ===========================================================
-- File: 2023_01_23_144001_add_slug_to_categories_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_01_23_144001_add_slug_to_categories_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "categories" ADD COLUMN "slug" varchar(255) NULL;


-- ===========================================================
-- File: 2023_01_23_144119_add_slug_to_item_campaigns_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_01_23_144119_add_slug_to_item_campaigns_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "item_campaigns" ADD COLUMN "slug" varchar(255) NULL;


-- ===========================================================
-- File: 2023_01_23_144232_add_slug_to_stores_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_01_23_144232_add_slug_to_stores_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "stores" ADD COLUMN "slug" varchar(255) NULL;


-- ===========================================================
-- File: 2023_01_23_144828_add_tax_status_column_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_01_23_144828_add_tax_status_column_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "tax_status" varchar(255) NULL;


-- ===========================================================
-- File: 2023_01_30_114113_change_delivery_charge_column_type_to_admin_wallets_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_01_30_114113_change_delivery_charge_column_type_to_admin_wallets_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "admin_wallets" ADD COLUMN "delivery_charge" numeric('delivery_charge',24) NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2023_02_19_164536_create_visitor_logs_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_02_19_164536_create_visitor_logs_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "visitor_logs" (
  "id" bigserial PRIMARY KEY,
  "visitor_log_type" varchar(255) NOT NULL,
  "visitor_log_id" bigint NOT NULL,
  "user_id" bigint NULL,
  "visit_count" integer NOT NULL DEFAULT 0,
  "order_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_02_25_133200_create_d_m_vehicles_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_02_25_133200_create_d_m_vehicles_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "d_m_vehicles" (
  "id" bigserial PRIMARY KEY,
  "type" varchar(255) NOT NULL,
  "starting_coverage_area" numeric('starting_coverage_area',16) NOT NULL,
  "maximum_coverage_area" numeric('maximum_coverage_area',16) NOT NULL,
  "extra_charges" numeric('extra_charges',16) NOT NULL,
  "status" boolean NOT NULL DEFAULT 0,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_02_25_133302_add_vehicle_id_column_to_delivery_men_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_02_25_133302_add_vehicle_id_column_to_delivery_men_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "delivery_men" ADD COLUMN "vehicle_id" bigint NULL;


-- ===========================================================
-- File: 2023_02_25_133409_add_vehicle_id_column_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_02_25_133409_add_vehicle_id_column_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "dm_vehicle_id" bigint NULL;


-- ===========================================================
-- File: 2023_02_25_163329_add_maximum_delivery_charge_column_to_module_zone_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_02_25_163329_add_maximum_delivery_charge_column_to_module_zone_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "module_zone" ADD COLUMN "maximum_shipping_charge" numeric('maximum_shipping_charge',23) NULL;


-- ===========================================================
-- File: 2023_02_25_175825_add_otp_hit_count_cols_in_phone_verifications_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_02_25_175825_add_otp_hit_count_cols_in_phone_verifications_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "phone_verifications" ADD COLUMN "otp_hit_count" smallint NOT NULL DEFAULT '0';
ALTER TABLE "phone_verifications" ADD COLUMN "is_blocked" boolean NOT NULL DEFAULT '0';
ALTER TABLE "phone_verifications" ADD COLUMN "is_temp_blocked" boolean NOT NULL DEFAULT '0';


-- ===========================================================
-- File: 2023_02_25_175912_add_hit_count_at_col_in_password_resets_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_02_25_175912_add_hit_count_at_col_in_password_resets_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "password_resets" ADD COLUMN "otp_hit_count" smallint NOT NULL DEFAULT '0';
ALTER TABLE "password_resets" ADD COLUMN "is_blocked" boolean NOT NULL DEFAULT '0';
ALTER TABLE "password_resets" ADD COLUMN "is_temp_blocked" boolean NOT NULL DEFAULT '0';


-- ===========================================================
-- File: 2023_02_26_144503_add_campaign_status_to_campaign_store_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_02_26_144503_add_campaign_status_to_campaign_store_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "campaign_store" ADD COLUMN "campaign_status" varchar(255) NULL DEFAULT 'pending';


-- ===========================================================
-- File: 2023_02_26_162224_add_recommened_to_items_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_02_26_162224_add_recommened_to_items_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "items" ADD COLUMN "recommended" boolean NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2023_02_27_102931_add_ref_by_col_to_users_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_02_27_102931_add_ref_by_col_to_users_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "users" ADD COLUMN "ref_by" bigint NULL;


-- ===========================================================
-- File: 2023_02_27_111635_create_order_cancel_reasons_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_02_27_111635_create_order_cancel_reasons_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "order_cancel_reasons" (
  "id" bigserial PRIMARY KEY,
  "reason" varchar(255) NOT NULL,
  "user_type" varchar(255) NOT NULL,
  "status" boolean NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_02_27_111937_add_cancellation_reason_col_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_02_27_111937_add_cancellation_reason_col_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "cancellation_reason" varchar(255) NULL;
ALTER TABLE "orders" ADD COLUMN "canceled_by" varchar(255) NULL;


-- ===========================================================
-- File: 2023_02_27_161418_add_created_by_columns_to_coupons_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_02_27_161418_add_created_by_columns_to_coupons_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "coupons" ADD COLUMN "created_by" varchar(255) NULL DEFAULT 'admin';
ALTER TABLE "coupons" ADD COLUMN "customer_id" varchar(255) NULL DEFAULT json_encode(['all'];
ALTER TABLE "coupons" ADD COLUMN "slug" varchar(255) NULL;
ALTER TABLE "coupons" ADD COLUMN "store_id" bigint NULL;


-- ===========================================================
-- File: 2023_02_27_161533_add_created_by_columns_to_expenses_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_02_27_161533_add_created_by_columns_to_expenses_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "expenses" ADD COLUMN "created_by" varchar(255) NULL DEFAULT 'admin';
ALTER TABLE "expenses" ADD COLUMN "store_id" bigint NULL;


-- ===========================================================
-- File: 2023_02_27_162252_add_store_expense_columns_to_order_transactions_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_02_27_162252_add_store_expense_columns_to_order_transactions_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "order_transactions" ADD COLUMN "store_expense" numeric('store_expense',23) NULL DEFAULT 0;


-- ===========================================================
-- File: 2023_02_27_162357_add_coupon_created_by_columns_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_02_27_162357_add_coupon_created_by_columns_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "coupon_created_by" varchar(255) NULL;


-- ===========================================================
-- File: 2023_03_01_154319_add_maximum_delivery_charge_column_to_stores_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_03_01_154319_add_maximum_delivery_charge_column_to_stores_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "stores" ADD COLUMN "maximum_shipping_charge" numeric('maximum_shipping_charge',23) NULL;


-- ===========================================================
-- File: 2023_03_02_103114_add_discount_on_product_by_column_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_03_02_103114_add_discount_on_product_by_column_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "discount_on_product_by" varchar(255) NOT NULL DEFAULT 'vendor';


-- ===========================================================
-- File: 2023_03_02_143919_change_amount_column_to_expenses_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_03_02_143919_change_amount_column_to_expenses_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "expenses" ADD COLUMN "amount" numeric('amount',23) NOT NULL DEFAULT 0;
ALTER TABLE "expenses" ADD COLUMN "delivery_man_id" bigint NULL;


-- ===========================================================
-- File: 2023_03_02_144258_add_discount_amount_by_store_col_to_order_transactions_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_03_02_144258_add_discount_amount_by_store_col_to_order_transactions_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "order_transactions" ADD COLUMN "discount_amount_by_store" numeric('discount_amount_by_store',23) NULL DEFAULT 0;


-- ===========================================================
-- File: 2023_03_11_120645_add_temp_block_time_col_to_phone_verifications_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_03_11_120645_add_temp_block_time_col_to_phone_verifications_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "phone_verifications" ADD COLUMN "temp_block_time" timestamp NULL;


-- ===========================================================
-- File: 2023_03_11_121000_add_temp_block_time_col_to_password_resets_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_03_11_121000_add_temp_block_time_col_to_password_resets_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "password_resets" ADD COLUMN "temp_block_time" timestamp NULL;


-- ===========================================================
-- File: 2023_03_13_181502_add_temp_token_column_to_users_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_03_13_181502_add_temp_token_column_to_users_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "users" ADD COLUMN "temp_token" varchar(255) NULL;
ALTER TABLE "users" ADD COLUMN "phone" varchar(255) NULL;
ALTER TABLE "users" ADD COLUMN "password" varchar(255) NULL;


-- ===========================================================
-- File: 2023_04_05_112916_add_created_by_col_to_password_resets_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_04_05_112916_add_created_by_col_to_password_resets_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "password_resets" ADD COLUMN "created_by" varchar(255) NULL DEFAULT 'user';


-- ===========================================================
-- File: 2023_05_04_100012_create_data_settings_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_05_04_100012_create_data_settings_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "data_settings" (
  "id" bigserial PRIMARY KEY,
  "key" varchar(255) NULL,
  "value" text NULL,
  "type" varchar(255) NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_05_04_100930_create_admin_promotional_banners_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_05_04_100930_create_admin_promotional_banners_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "admin_promotional_banners" (
  "id" bigserial PRIMARY KEY,
  "title" varchar(255) NULL,
  "sub_title" varchar(255) NULL,
  "image" varchar(255) NULL,
  "status" boolean NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_05_04_101825_create_admin_features_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_05_04_101825_create_admin_features_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "admin_features" (
  "id" bigserial PRIMARY KEY,
  "title" varchar(255) NULL,
  "sub_title" varchar(255) NULL,
  "image" varchar(255) NULL,
  "status" boolean NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_05_04_102015_create_admin_special_criterias_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_05_04_102015_create_admin_special_criterias_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "admin_special_criterias" (
  "id" bigserial PRIMARY KEY,
  "title" varchar(255) NULL,
  "image" varchar(255) NULL,
  "status" boolean NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_05_07_152523_create_admin_testimonials_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_05_07_152523_create_admin_testimonials_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "admin_testimonials" (
  "id" bigserial PRIMARY KEY,
  "name" varchar(255) NULL,
  "designation" varchar(255) NULL,
  "review" text NULL,
  "reviewer_image" varchar(255) NULL,
  "company_image" varchar(255) NULL,
  "status" boolean NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_05_07_173609_create_flutter_special_criterias_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_05_07_173609_create_flutter_special_criterias_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "flutter_special_criterias" (
  "id" bigserial PRIMARY KEY,
  "title" varchar(255) NULL,
  "image" varchar(255) NULL,
  "status" boolean NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_05_08_125811_create_react_testimonials_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_05_08_125811_create_react_testimonials_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "react_testimonials" (
  "id" bigserial PRIMARY KEY,
  "name" varchar(255) NULL,
  "designation" varchar(255) NULL,
  "review" text NULL,
  "reviewer_image" varchar(255) NULL,
  "company_image" varchar(255) NULL,
  "status" boolean NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_05_09_170006_create_email_templates_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_05_09_170006_create_email_templates_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "email_templates" (
  "id" bigserial PRIMARY KEY,
  "title" varchar(255) NULL,
  "body" text NULL,
  "background_image" varchar(255) NULL,
  "image" varchar(255) NULL,
  "logo" varchar(255) NULL,
  "icon" varchar(255) NULL,
  "button_name" varchar(255) NULL,
  "button_url" varchar(255) NULL,
  "footer_text" varchar(255) NULL,
  "copyright_text" varchar(255) NULL,
  "type" varchar(255) NULL,
  "email_type" varchar(255) NULL,
  "email_template" varchar(255) NULL,
  "privacy" boolean NOT NULL DEFAULT 0,
  "refund" boolean NOT NULL DEFAULT 0,
  "cancelation" boolean NOT NULL DEFAULT 0,
  "contact" boolean NOT NULL DEFAULT 0,
  "facebook" boolean NOT NULL DEFAULT 0,
  "instagram" boolean NOT NULL DEFAULT 0,
  "twitter" boolean NOT NULL DEFAULT 0,
  "linkedin" boolean NOT NULL DEFAULT 0,
  "pinterest" boolean NOT NULL DEFAULT 0,
  "status" boolean NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_05_14_104308_create_react_promotional_banners_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_05_14_104308_create_react_promotional_banners_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "react_promotional_banners" (
  "id" bigserial PRIMARY KEY,
  "title" varchar(255) NULL,
  "description" text NULL,
  "image" varchar(255) NULL,
  "status" boolean NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_05_16_104129_add_cutlery_processing_time_unavailable_product_note_col_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_05_16_104129_add_cutlery_processing_time_unavailable_product_note_col_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "processing_time" varchar(255) NULL;
ALTER TABLE "orders" ADD COLUMN "unavailable_item_note" varchar(255) NULL;
ALTER TABLE "orders" ADD COLUMN "cutlery" boolean NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2023_05_18_093438_add_featured_col_to_categories_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_05_18_093438_add_featured_col_to_categories_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "categories" ADD COLUMN "featured" boolean NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2023_05_18_143530_add_delivery_instruction_col_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_05_18_143530_add_delivery_instruction_col_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "delivery_instruction" text NULL;


-- ===========================================================
-- File: 2023_05_18_163841_add_organic_col_to_items_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_05_18_163841_add_organic_col_to_items_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "items" ADD COLUMN "organic" boolean NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2023_05_28_153920_add_tax_percentage_col_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_05_28_153920_add_tax_percentage_col_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "tax_percentage" numeric('tax_percentage',24) NULL;


-- ===========================================================
-- File: 2023_06_11_172741_add_cutlery_col_to_stores_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_06_11_172741_add_cutlery_col_to_stores_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "stores" ADD COLUMN "cutlery" boolean NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2023_07_05_104537_add_maximum_cart_quantity_col_to_items_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_07_05_104537_add_maximum_cart_quantity_col_to_items_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "items" ADD COLUMN "maximum_cart_quantity" integer NULL;


-- ===========================================================
-- File: 2023_07_05_135741_add_service_charge_col_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_07_05_135741_add_service_charge_col_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "additional_charge" numeric('additional_charge',23) NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2023_07_05_145800_add_service_charge_col_to_order_transactions_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_07_05_145800_add_service_charge_col_to_order_transactions_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "order_transactions" ADD COLUMN "additional_charge" numeric('additional_charge',23) NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2023_07_05_155429_add_order_proof_col_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_07_05_155429_add_order_proof_col_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "order_proof" varchar(255) NULL;


-- ===========================================================
-- File: 2023_07_06_124530_add_partially_paid_amount_col_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_07_06_124530_add_partially_paid_amount_col_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "partially_paid_amount" numeric('partially_paid_amount',23) NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2023_07_06_144944_create_order_payments_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_07_06_144944_create_order_payments_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "order_payments" (
  "id" bigserial PRIMARY KEY,
  "order_id" bigint NOT NULL,
  "transaction_ref" varchar(255) NULL,
  "amount" numeric NOT NULL DEFAULT 0,
  "payment_status" varchar(255) NOT NULL,
  "payment_method" varchar(255) NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_07_09_120533_add_meta_cols_to_stores_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_07_09_120533_add_meta_cols_to_stores_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "stores" ADD COLUMN "meta_title" varchar(255) NULL;
ALTER TABLE "stores" ADD COLUMN "meta_description" text NULL;
ALTER TABLE "stores" ADD COLUMN "meta_image" varchar(255) NULL;


-- ===========================================================
-- File: 2023_07_09_143746_create_wallet_payments_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_07_09_143746_create_wallet_payments_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "wallet_payments" (
  "id" bigserial PRIMARY KEY,
  "user_id" bigint NOT NULL,
  "transaction_ref" varchar(255) NULL,
  "amount" numeric NOT NULL DEFAULT 0,
  "payment_status" varchar(255) NOT NULL,
  "payment_method" varchar(255) NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_07_10_121938_create_wallet_bonuses_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_07_10_121938_create_wallet_bonuses_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "wallet_bonuses" (
  "id" bigserial PRIMARY KEY,
  "title" varchar(255) NOT NULL,
  "description" text NULL,
  "bonus_type" varchar(255) NOT NULL,
  "bonus_amount" numeric('bonus_amount',23) NOT NULL DEFAULT 0,
  "minimum_add_amount" numeric('minimum_add_amount',23) NOT NULL DEFAULT 0,
  "maximum_bonus_amount" numeric('maximum_bonus_amount',23) NOT NULL DEFAULT 0,
  "start_date" date NULL,
  "end_date" date NULL,
  "status" boolean NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_07_10_153950_add_user_id_col_to_expenses_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_07_10_153950_add_user_id_col_to_expenses_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "expenses" ADD COLUMN "user_id" bigint NULL;


-- ===========================================================
-- File: 2023_07_19_124016_add_maximum_cart_quantity_col_to_item_campaigns_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_07_19_124016_add_maximum_cart_quantity_col_to_item_campaigns_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "item_campaigns" ADD COLUMN "maximum_cart_quantity" integer NULL;


-- ===========================================================
-- File: 2023_08_10_131937_create_offline_payment_methods_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_08_10_131937_create_offline_payment_methods_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "offline_payment_methods" (
  "id" bigserial PRIMARY KEY,
  "method_name" varchar(255) NOT NULL,
  "method_fields" text NOT NULL,
  "method_informations" text NOT NULL,
  "status" smallint NOT NULL DEFAULT 0,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_08_10_132315_create_offline_payments_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_08_10_132315_create_offline_payments_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "offline_payments" (
  "id" bigserial PRIMARY KEY,
  "order_id" bigint NOT NULL,
  "payment_info" jsonb NULL,
  "status" varchar(255) NOT NULL DEFAULT 'pending',
  "note" text NULL,
  "customer_note" text NULL,
  "method_fields" text NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_08_14_123526_create_temp_products_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_08_14_123526_create_temp_products_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "temp_products" (
  "id" bigserial PRIMARY KEY,
  "name" varchar(255) NULL,
  "description" text NULL,
  "image" varchar(255) NULL,
  "images" text NULL,
  "store_id" bigint NOT NULL,
  "module_id" bigint NOT NULL,
  "unit_id" bigint NULL,
  "item_id" bigint NULL,
  "category_id" bigint NULL,
  "category_ids" varchar(255) NULL,
  "tag_ids" varchar(255) NULL,
  "slug" varchar(255) NULL,
  "variations" text NULL,
  "food_variations" text NULL,
  "add_ons" varchar(255) NULL,
  "attributes" varchar(255) NULL,
  "choice_options" text NULL,
  "price" numeric('price',24) NOT NULL DEFAULT 0,
  "tax" numeric('tax',24) NOT NULL DEFAULT 0,
  "tax_type" varchar(255) NOT NULL DEFAULT 'percent',
  "discount" numeric NOT NULL DEFAULT 0,
  "discount_type" varchar(255) NOT NULL DEFAULT 'percent',
  "veg" boolean NOT NULL DEFAULT 0,
  "recommended" boolean NOT NULL DEFAULT 0,
  "organic" boolean NOT NULL DEFAULT 0,
  "common_condition_id" bigint NULL,
  "basic" boolean NOT NULL DEFAULT 0,
  "status" boolean NOT NULL DEFAULT 1,
  "stock" integer NULL DEFAULT 0,
  "maximum_cart_quantity" integer NULL,
  "note" text NULL,
  "is_rejected" boolean NOT NULL DEFAULT 0,
  "available_time_ends" time NULL,
  "available_time_starts" time NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_08_14_153229_add_is_approved_col_to_items_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_08_14_153229_add_is_approved_col_to_items_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "items" ADD COLUMN "is_approved" boolean NOT NULL DEFAULT 1;


-- ===========================================================
-- File: 2023_08_20_143852_add_created_by_col_to_banners_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_08_20_143852_add_created_by_col_to_banners_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "banners" ADD COLUMN "title" varchar(255) NULL;
ALTER TABLE "banners" ADD COLUMN "created_by" varchar(255) NOT NULL DEFAULT 'admin';


-- ===========================================================
-- File: 2023_08_21_115610_add_announcement_cols_to_stores_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_08_21_115610_add_announcement_cols_to_stores_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "stores" ADD COLUMN "announcement" boolean NOT NULL DEFAULT 0;
ALTER TABLE "stores" ADD COLUMN "announcement_message" varchar(255) NULL;


-- ===========================================================
-- File: 2023_08_21_173527_create_guests_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_08_21_173527_create_guests_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "guests" (
  "id" bigserial PRIMARY KEY,
  "ip_address" varchar(255) NULL,
  "fcm_token" varchar(255) NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_08_22_102914_add_is_guest_col_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_08_22_102914_add_is_guest_col_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "is_guest" boolean NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2023_08_24_123045_create_common_conditions_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_08_24_123045_create_common_conditions_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "common_conditions" (
  "id" bigserial PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "slug" varchar(255) NULL,
  "status" boolean NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_08_24_151032_create_pharmacy_item_details_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_08_24_151032_create_pharmacy_item_details_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "pharmacy_item_details" (
  "id" bigserial PRIMARY KEY,
  "item_id" bigint NULL,
  "common_condition_id" bigint NULL,
  "is_basic" boolean NOT NULL DEFAULT 0,
  "temp_product_id" bigint NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_08_26_164947_create_module_wise_banners_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_08_26_164947_create_module_wise_banners_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "module_wise_banners" (
  "id" bigserial PRIMARY KEY,
  "module_id" bigint NOT NULL,
  "key" varchar(255) NULL,
  "value" text NULL,
  "type" varchar(255) NULL,
  "status" boolean NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_08_27_123438_create_module_wise_why_chooses_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_08_27_123438_create_module_wise_why_chooses_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "module_wise_why_chooses" (
  "id" bigserial PRIMARY KEY,
  "module_id" bigint NOT NULL,
  "title" varchar(255) NULL,
  "short_description" varchar(255) NULL,
  "image" varchar(255) NULL,
  "status" boolean NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_08_28_114316_create_flash_sales_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_08_28_114316_create_flash_sales_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "flash_sales" (
  "id" bigserial PRIMARY KEY,
  "module_id" bigint NOT NULL,
  "title" varchar(255) NULL,
  "is_publish" boolean NOT NULL DEFAULT 1,
  "admin_discount_percentage" numeric('admin_discount_percentage',24) NOT NULL,
  "vendor_discount_percentage" numeric('vendor_discount_percentage',24) NOT NULL,
  "start_date" timestamp NULL,
  "end_date" timestamp NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_08_28_134428_create_flash_sale_items_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_08_28_134428_create_flash_sale_items_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "flash_sale_items" (
  "id" bigserial PRIMARY KEY,
  "flash_sale_id" bigint NOT NULL,
  "item_id" bigint NOT NULL,
  "stock" integer NOT NULL,
  "sold" integer NOT NULL DEFAULT 0,
  "available_stock" integer NOT NULL,
  "discount_type" varchar(255) NOT NULL,
  "discount" numeric('discount',23) NOT NULL DEFAULT 0,
  "discount_amount" numeric('discount_amount',23) NOT NULL DEFAULT 0,
  "price" numeric('price',23) NOT NULL DEFAULT 0,
  "status" boolean NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_09_07_131829_create_carts_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_09_07_131829_create_carts_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "carts" (
  "id" bigserial PRIMARY KEY,
  "user_id" bigint NOT NULL,
  "module_id" bigint NOT NULL,
  "item_id" bigint NOT NULL,
  "is_guest" boolean NOT NULL DEFAULT 0,
  "add_on_ids" text NULL,
  "add_on_qtys" text NULL,
  "item_type" varchar(255) NOT NULL,
  "price" numeric('price',24) NOT NULL,
  "quantity" integer NOT NULL,
  "variation" text NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_09_20_122921_create_store_configs_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_09_20_122921_create_store_configs_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "store_configs" (
  "id" bigserial PRIMARY KEY,
  "store_id" bigint NOT NULL,
  "is_recommended" boolean NOT NULL DEFAULT 0,
  "is_recommended_deleted" boolean NOT NULL DEFAULT 0,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_09_23_184806_add_flash_sale_cols_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_09_23_184806_add_flash_sale_cols_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "flash_admin_discount_amount" numeric('flash_admin_discount_amount',24) NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN "flash_store_discount_amount" numeric('flash_store_discount_amount',24) NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2023_10_08_103818_add_increased_delivery_fee_in_zones_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_10_08_103818_add_increased_delivery_fee_in_zones_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "zones" ADD COLUMN "increased_delivery_fee" numeric('increased_delivery_fee',8) NOT NULL DEFAULT '0';
ALTER TABLE "zones" ADD COLUMN "increased_delivery_fee_status" boolean NOT NULL DEFAULT '0';
ALTER TABLE "zones" ADD COLUMN "increase_delivery_charge_message" varchar(255) NULL;
ALTER TABLE "zones" ADD COLUMN "offline_payment" boolean NOT NULL DEFAULT FALSE;


-- ===========================================================
-- File: 2023_11_21_123038_create_withdrawal_methods_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_11_21_123038_create_withdrawal_methods_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "withdrawal_methods" (
  "id" bigserial PRIMARY KEY,
  "method_name" varchar(255) NOT NULL,
  "method_fields" text NOT NULL,
  "is_default" smallint NOT NULL DEFAULT 0,
  "is_active" smallint NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_11_21_123229_create_disbursement_withdrawal_methods_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_11_21_123229_create_disbursement_withdrawal_methods_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "disbursement_withdrawal_methods" (
  "id" bigserial PRIMARY KEY,
  "store_id" bigint NULL,
  "delivery_man_id" bigint NULL,
  "withdrawal_method_id" bigint NOT NULL,
  "method_name" varchar(255) NOT NULL,
  "method_fields" text NOT NULL,
  "is_default" smallint NOT NULL DEFAULT 0,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_11_21_123320_create_disbursements_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_11_21_123320_create_disbursements_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "disbursements" (
  "id" bigserial PRIMARY KEY,
  "title" varchar(255) NOT NULL,
  "description" text NULL,
  "total_amount" numeric('total_amount',23) NOT NULL DEFAULT 0,
  "status" varchar(255) NOT NULL DEFAULT 'pending',
  "created_for" varchar(255) NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_11_21_123742_add_cols_to_withdraw_requests_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_11_21_123742_add_cols_to_withdraw_requests_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "withdraw_requests" ADD COLUMN "delivery_man_id" bigint NULL;
ALTER TABLE "withdraw_requests" ADD COLUMN "withdrawal_method_id" bigint NULL;
ALTER TABLE "withdraw_requests" ADD COLUMN "withdrawal_method_fields" jsonb NULL;
ALTER TABLE "withdraw_requests" ADD COLUMN "vendor_id" bigint NULL;
ALTER TABLE "withdraw_requests" ADD COLUMN "type" varchar(255) NOT NULL DEFAULT 'manual';


-- ===========================================================
-- File: 2023_11_21_124049_create_disbursement_details_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_11_21_124049_create_disbursement_details_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "disbursement_details" (
  "id" bigserial PRIMARY KEY,
  "disbursement_id" bigint NOT NULL,
  "store_id" bigint NULL,
  "delivery_man_id" bigint NULL,
  "disbursement_amount" numeric('disbursement_amount',23) NOT NULL DEFAULT 0,
  "payment_method" bigint NOT NULL,
  "status" varchar(255) NOT NULL DEFAULT 'pending',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2023_11_21_160728_add_created_by_col_to_account_transactions_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_11_21_160728_add_created_by_col_to_account_transactions_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "account_transactions" ADD COLUMN "type" varchar(255) NOT NULL DEFAULT 'collected';
ALTER TABLE "account_transactions" ADD COLUMN "created_by" varchar(255) NOT NULL DEFAULT 'admin';


-- ===========================================================
-- File: 2023_11_23_093859_create_parcel_delivery_instructions_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2023_11_23_093859_create_parcel_delivery_instructions_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "parcel_delivery_instructions" (
  "id" bigserial PRIMARY KEY,
  "instruction" varchar(255) NOT NULL,
  "status" boolean NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_01_17_105010_create_order_references_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_01_17_105010_create_order_references_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "order_references" (
  "id" bigserial PRIMARY KEY,
  "order_id" bigint NOT NULL,
  "is_reviewed" boolean NOT NULL DEFAULT 0,
  "is_review_canceled" boolean NOT NULL DEFAULT 0,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_04_01_124630_create_cash_backs_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_04_01_124630_create_cash_backs_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "cash_backs" (
  "id" bigserial PRIMARY KEY,
  "title" varchar(255) NOT NULL,
  "customer_id" varchar(255) NULL DEFAULT json_encode(['all'],
  "cashback_type" varchar(255) NOT NULL,
  "same_user_limit" integer NOT NULL DEFAULT 1,
  "total_used" integer NOT NULL DEFAULT 0,
  "cashback_amount" numeric('cashback_amount',23) NOT NULL DEFAULT 0,
  "min_purchase" numeric('min_purchase',23) NOT NULL DEFAULT 0,
  "max_discount" numeric('max_discount',23) NOT NULL DEFAULT 0,
  "start_date" date NULL,
  "end_date" date NULL,
  "status" boolean NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_04_01_130213_add_is_halal_col_to_items_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_04_01_130213_add_is_halal_col_to_items_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "items" ADD COLUMN "is_halal" boolean NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2024_04_01_130644_add_body_2_col_to_email_templates_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_04_01_130644_add_body_2_col_to_email_templates_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "email_templates" ADD COLUMN "body_2" text NULL;


-- ===========================================================
-- File: 2024_04_01_142631_add_is_prescription_required_col_to_pharmacy_item_details_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_04_01_142631_add_is_prescription_required_col_to_pharmacy_item_details_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "pharmacy_item_details" ADD COLUMN "is_prescription_required" boolean NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2024_04_02_112611_create_brands_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_04_02_112611_create_brands_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "brands" (
  "id" bigserial PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "slug" varchar(255) NULL,
  "image" varchar(255) NULL,
  "status" boolean NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_04_02_122002_create_ecommerce_item_details_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_04_02_122002_create_ecommerce_item_details_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "ecommerce_item_details" (
  "id" bigserial PRIMARY KEY,
  "item_id" bigint NULL,
  "brand_id" bigint NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_04_02_133855_create_cash_back_histories_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_04_02_133855_create_cash_back_histories_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "cash_back_histories" (
  "id" bigserial PRIMARY KEY,
  "cash_back_id" bigint NULL,
  "order_id" bigint NULL,
  "user_id" bigint NULL,
  "cashback_type" varchar(255) NOT NULL,
  "calculated_amount" numeric('calculated_amount',23) NOT NULL DEFAULT 0,
  "cashback_amount" numeric('cashback_amount',23) NOT NULL DEFAULT 0,
  "min_purchase" numeric('min_purchase',23) NOT NULL DEFAULT 0,
  "max_discount" numeric('max_discount',23) NOT NULL DEFAULT 0,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_04_04_085842_add_interested_module_ids_col_to_users_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_04_04_085842_add_interested_module_ids_col_to_users_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "users" ADD COLUMN "module_ids" varchar(255) NULL;


-- ===========================================================
-- File: 2024_04_18_171021_add_halal_extra_packaging_cols_to_store_configs_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_04_18_171021_add_halal_extra_packaging_cols_to_store_configs_table.php
-- Auto-generated. Review before running on production.




-- ===========================================================
-- File: 2024_04_18_171206_add_halal_brand_cols_to_temp_products_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_04_18_171206_add_halal_brand_cols_to_temp_products_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "temp_products" ADD COLUMN "is_halal" boolean NOT NULL DEFAULT 0;
ALTER TABLE "temp_products" ADD COLUMN "brand_id" boolean NOT NULL DEFAULT 0;
ALTER TABLE "temp_products" ADD COLUMN "is_prescription_required" boolean NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2024_04_18_171851_add_cashback_ref_amount_cols_to_temp_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_04_18_171851_add_cashback_ref_amount_cols_to_temp_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "cash_back_id" bigint NULL;
ALTER TABLE "orders" ADD COLUMN "extra_packaging_amount" numeric('extra_packaging_amount',23) NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN "ref_bonus_amount" numeric('ref_bonus_amount',23) NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2024_04_18_172145_add_extrapackaging_ref_amount_cols_to_temp_order_transactions_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_04_18_172145_add_extrapackaging_ref_amount_cols_to_temp_order_transactions_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "order_transactions" ADD COLUMN "extra_packaging_amount" numeric('extra_packaging_amount',23) NOT NULL DEFAULT 0;
ALTER TABLE "order_transactions" ADD COLUMN "ref_bonus_amount" numeric('ref_bonus_amount',23) NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2024_05_13_102547_create_subscription_packages_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_05_13_102547_create_subscription_packages_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "subscription_packages" (
  "id" bigserial PRIMARY KEY,
  "package_name" varchar(255) NOT NULL,
  "price" numeric('price',24) NOT NULL,
  "validity" integer NOT NULL,
  "max_order" varchar(255) NOT NULL DEFAULT 'unlimited',
  "max_product" varchar(255) NOT NULL DEFAULT 'unlimited',
  "pos" boolean NOT NULL DEFAULT FALSE,
  "mobile_app" boolean NOT NULL DEFAULT FALSE,
  "chat" boolean NOT NULL DEFAULT FALSE,
  "review" boolean NOT NULL DEFAULT FALSE,
  "self_delivery" boolean NOT NULL DEFAULT FALSE,
  "status" boolean NOT NULL DEFAULT TRUE,
  "default" boolean NOT NULL DEFAULT FALSE,
  "colour" varchar(255) NULL,
  "text" text NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_05_13_102612_create_store_subscriptions_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_05_13_102612_create_store_subscriptions_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "store_subscriptions" (
  "id" bigserial PRIMARY KEY,
  "package_id" bigint NOT NULL,
  "store_id" bigint NOT NULL,
  "expiry_date" date NOT NULL,
  "validity" integer NOT NULL DEFAULT 0,
  "max_order" varchar(255) NOT NULL,
  "max_product" varchar(255) NOT NULL,
  "pos" boolean NOT NULL DEFAULT FALSE,
  "mobile_app" boolean NOT NULL DEFAULT FALSE,
  "chat" boolean NOT NULL DEFAULT FALSE,
  "review" boolean NOT NULL DEFAULT FALSE,
  "self_delivery" boolean NOT NULL DEFAULT FALSE,
  "status" boolean NOT NULL DEFAULT TRUE,
  "is_trial" boolean NOT NULL DEFAULT FALSE,
  "total_package_renewed" smallint NOT NULL DEFAULT 0,
  "renewed_at" timestamp NULL,
  "is_canceled" boolean NOT NULL DEFAULT FALSE,
  "canceled_by" varchar CHECK ("canceled_by" IN ('none', 'admin', 'store')) NOT NULL DEFAULT 'none',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_05_13_104250_create_subscription_transactions_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_05_13_104250_create_subscription_transactions_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "subscription_transactions" (
  "id" bigserial PRIMARY KEY,
  "package_id" bigint NOT NULL,
  "store_id" bigint NOT NULL,
  "store_subscription_id" bigint NULL,
  "price" numeric('price',24) NOT NULL DEFAULT 0,
  "previous_due" numeric('previous_due',24) NOT NULL DEFAULT 0,
  "validity" integer NOT NULL DEFAULT 0,
  "payment_method" varchar(255) NOT NULL,
  "payment_status" varchar(255) NOT NULL,
  "reference" varchar(255) NULL,
  "paid_amount" numeric('paid_amount',24) NOT NULL,
  "discount" integer NOT NULL DEFAULT 0,
  "package_details" jsonb NOT NULL,
  "created_by" varchar(255) NOT NULL,
  "is_trial" boolean NOT NULL DEFAULT FALSE,
  "transaction_status" boolean NOT NULL DEFAULT 1,
  "plan_type" varchar CHECK ("plan_type" IN ('renew', 'new_plan', 'first_purchased', 'free_trial')) NOT NULL DEFAULT 'first_purchased',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_05_13_170120_add_store_business_model_col_to_stores_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_05_13_170120_add_store_business_model_col_to_stores_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "stores" ADD COLUMN "store_business_model" varchar CHECK ("store_business_model" IN ('none', 'commission', 'subscription', 'unsubscribed')) NOT NULL DEFAULT 'commission';


-- ===========================================================
-- File: 2024_05_14_175408_add_reply_col_to_reviews_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_05_14_175408_add_reply_col_to_reviews_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "reviews" ADD COLUMN "store_id" bigint NULL;
ALTER TABLE "reviews" ADD COLUMN "reply" text NULL;
ALTER TABLE "reviews" ADD COLUMN "review_id" varchar(255) NULL;


-- ===========================================================
-- File: 2024_05_16_113516_create_storages_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_05_16_113516_create_storages_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "storages" (
  "id" bigserial PRIMARY KEY,
  "data_type" varchar(255) NOT NULL,
  "data_id" varchar(255) NOT NULL,
  "key" varchar(255) NULL,
  "value" varchar(255) NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_05_22_115717_create_subscription_billing_and_refund_histories_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_05_22_115717_create_subscription_billing_and_refund_histories_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "subscription_billing_and_refund_histories" (
  "id" bigserial PRIMARY KEY,
  "store_id" bigint NOT NULL,
  "subscription_id" bigint NOT NULL,
  "package_id" bigint NULL,
  "transaction_type" varchar CHECK ("transaction_type" IN ('pending_bill', 'refund')) NOT NULL DEFAULT 'pending_bill',
  "amount" numeric('amount',24) NOT NULL,
  "is_success" boolean NOT NULL DEFAULT 0,
  "reference" varchar(255) NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_05_26_120621_add_subscription_model_to_order_transaction_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_05_26_120621_add_subscription_model_to_order_transaction_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "order_transactions" ADD COLUMN "commission_percentage" numeric('commission_percentage',16) NULL DEFAULT 0;
ALTER TABLE "order_transactions" ADD COLUMN "is_subscribed" boolean NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2024_05_28_110550_add_change_file_column_to_messages_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_05_28_110550_add_change_file_column_to_messages_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "messages" ADD COLUMN "file" text NULL;


-- ===========================================================
-- File: 2024_05_28_112559_add_change_order_attachment_column_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_05_28_112559_add_change_order_attachment_column_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "order_attachment" text NULL;
ALTER TABLE "orders" ADD COLUMN "order_proof" text NULL;


-- ===========================================================
-- File: 2024_07_07_111841_create_advertisements_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_07_07_111841_create_advertisements_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "advertisements" (
  "id" bigserial PRIMARY KEY,
  "store_id" bigint NOT NULL,
  "module_id" bigint NULL,
  "module_type" varchar(255) NULL,
  "add_type" varchar CHECK ("add_type" IN ('video_promotion', 'store_promotion')) NOT NULL DEFAULT 'store_promotion',
  "title" varchar(255) NULL,
  "description" text NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "pause_note" text NULL,
  "cancellation_note" text NULL,
  "cover_image" varchar(255) NULL,
  "profile_image" varchar(255) NULL,
  "video_attachment" varchar(255) NULL,
  "priority" integer NULL,
  "is_rating_active" boolean NOT NULL DEFAULT FALSE,
  "is_review_active" boolean NOT NULL DEFAULT FALSE,
  "is_paid" boolean NOT NULL DEFAULT FALSE,
  "is_updated" boolean NOT NULL DEFAULT FALSE,
  "created_by_id" bigint NOT NULL,
  "created_by_type" varchar(255) NOT NULL,
  "status" varchar CHECK ("status" IN ('pending', 'running', 'approved', 'expired', 'denied', 'paused')) NOT NULL DEFAULT 'pending',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_07_07_112117_create_notification_settings_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_07_07_112117_create_notification_settings_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "notification_settings" (
  "id" bigserial PRIMARY KEY,
  "title" varchar(255) NULL,
  "sub_title" text NULL,
  "key" varchar(255) NULL,
  "type" varchar CHECK ("type" IN ('admin', 'customer', 'store', 'deliveryman')) NOT NULL DEFAULT 'admin',
  "mail_status" varchar CHECK ("mail_status" IN ('active', 'inactive', 'disable')) NOT NULL DEFAULT 'disable',
  "sms_status" varchar CHECK ("sms_status" IN ('active', 'inactive', 'disable')) NOT NULL DEFAULT 'disable',
  "push_notification_status" varchar CHECK ("push_notification_status" IN ('active', 'inactive', 'disable')) NOT NULL DEFAULT 'disable',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_07_07_112203_create_store_notification_settings_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_07_07_112203_create_store_notification_settings_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "store_notification_settings" (
  "id" bigserial PRIMARY KEY,
  "title" varchar(255) NULL,
  "sub_title" text NULL,
  "key" varchar(255) NULL,
  "store_id" bigint NOT NULL,
  "mail_status" varchar CHECK ("mail_status" IN ('active', 'inactive', 'disable')) NOT NULL DEFAULT 'disable',
  "sms_status" varchar CHECK ("sms_status" IN ('active', 'inactive', 'disable')) NOT NULL DEFAULT 'disable',
  "push_notification_status" varchar CHECK ("push_notification_status" IN ('active', 'inactive', 'disable')) NOT NULL DEFAULT 'disable',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_07_10_165721_create_priority_lists_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_07_10_165721_create_priority_lists_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "priority_lists" (
  "id" bigserial PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "value" varchar(255) NOT NULL,
  "type" varchar(255) NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_07_14_182931_add_package_id_col_stores_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_07_14_182931_add_package_id_col_stores_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "stores" ADD COLUMN "package_id" bigint NULL;


-- ===========================================================
-- File: 2024_07_15_131402_add_replied_at_col_to_reviews_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_07_15_131402_add_replied_at_col_to_reviews_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "reviews" ADD COLUMN "replied_at" timestamp NULL;


-- ===========================================================
-- File: 2024_07_28_131816_create_external_configurations_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_07_28_131816_create_external_configurations_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "external_configurations" (
  "id" bigserial PRIMARY KEY,
  "key" varchar(255) NOT NULL,
  "value" text NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_09_11_094735_add_display_name_col_in_zones_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_09_11_094735_add_display_name_col_in_zones_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "zones" ADD COLUMN "display_name" varchar(255) NULL;


-- ===========================================================
-- File: 2024_09_11_105938_create_automated_messages_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_09_11_105938_create_automated_messages_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "automated_messages" (
  "id" bigserial PRIMARY KEY,
  "message" varchar(255) NULL,
  "status" boolean NOT NULL DEFAULT TRUE,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_09_11_134421_add_ordre_id_col_to_messages_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_09_11_134421_add_ordre_id_col_to_messages_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "messages" ADD COLUMN "order_id" bigint NULL;


-- ===========================================================
-- File: 2024_09_12_115801_create_nutritions_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_09_12_115801_create_nutritions_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "nutritions" (
  "id" bigserial PRIMARY KEY,
  "nutrition" varchar(255) NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_09_12_120019_create_allergies_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_09_12_120019_create_allergies_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "allergies" (
  "id" bigserial PRIMARY KEY,
  "allergy" varchar(255) NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_09_12_121929_create_allergy_item_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_09_12_121929_create_allergy_item_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "allergy_item" (
  "id" bigserial PRIMARY KEY,
  "item_id" bigint NOT NULL,
  "allergy_id" bigint NOT NULL
);


-- ===========================================================
-- File: 2024_09_12_121941_create_item_nutrition_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_09_12_121941_create_item_nutrition_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "item_nutrition" (
  "id" bigserial PRIMARY KEY,
  "item_id" bigint NOT NULL,
  "nutrition_id" bigint NOT NULL
);


-- ===========================================================
-- File: 2024_09_12_142834_add_nutrition_allergy_id_cols_to_temp_products_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_09_12_142834_add_nutrition_allergy_id_cols_to_temp_products_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "temp_products" ADD COLUMN "nutrition_ids" varchar(255) NULL;
ALTER TABLE "temp_products" ADD COLUMN "allergy_ids" varchar(255) NULL;
ALTER TABLE "temp_products" ADD COLUMN "generic_ids" varchar(255) NULL;


-- ===========================================================
-- File: 2024_09_15_112118_create_generic_names_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_09_15_112118_create_generic_names_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "generic_names" (
  "id" bigserial PRIMARY KEY,
  "generic_name" varchar(255) NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_09_15_112537_create_item_generic_names_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_09_15_112537_create_item_generic_names_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "item_generic_names" (
  "id" bigserial PRIMARY KEY,
  "item_id" bigint NOT NULL,
  "generic_name_id" bigint NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2024_10_21_153431_add_is_email_verified_col_to_users_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_10_21_153431_add_is_email_verified_col_to_users_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "users" ADD COLUMN "is_email_verified" boolean NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "is_from_pos" boolean NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2024_10_21_153607_add_phone_col_to_password_resets_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_10_21_153607_add_phone_col_to_password_resets_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "password_resets" ADD COLUMN "phone" varchar(255) NULL;
ALTER TABLE "password_resets" ADD COLUMN "email" varchar(255) NULL;


-- ===========================================================
-- File: 2024_10_22_103402_create_item_campaign_generic_names_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_10_22_103402_create_item_campaign_generic_names_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "item_campaign_generic_names" (
  "id" bigserial PRIMARY KEY,
  "item_campaign_id" bigint NOT NULL,
  "generic_name_id" bigint NOT NULL
);


-- ===========================================================
-- File: 2024_10_22_103440_create_allergy_item_campaign_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_10_22_103440_create_allergy_item_campaign_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "allergy_item_campaign" (
  "id" bigserial PRIMARY KEY,
  "item_campaign_id" bigint NOT NULL,
  "allergy_id" bigint NOT NULL
);


-- ===========================================================
-- File: 2024_10_22_103509_create_item_campaign_nutrition_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_10_22_103509_create_item_campaign_nutrition_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "item_campaign_nutrition" (
  "id" bigserial PRIMARY KEY,
  "item_campaign_id" bigint NOT NULL,
  "nutrition_id" bigint NOT NULL
);


-- ===========================================================
-- File: 2024_10_22_133944_add_minimum_stock_for_warning_col_to_store_confg.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_10_22_133944_add_minimum_stock_for_warning_col_to_store_confg.php
-- Auto-generated. Review before running on production.




-- ===========================================================
-- File: 2024_11_17_104649_create_cache_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_11_17_104649_create_cache_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "cache" (
  "key" varchar(255) NOT NULL,
  "value" text NOT NULL,
  "expiration" integer NOT NULL
);
CREATE TABLE IF NOT EXISTS "cache_locks" (
  "key" varchar(255) NOT NULL,
  "owner" varchar(255) NOT NULL,
  "expiration" integer NOT NULL
);


-- ===========================================================
-- File: 2024_12_03_142529_add_to_col_stores_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_12_03_142529_add_to_col_stores_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "stores" ADD COLUMN "pickup_zone_id" jsonb NULL;
ALTER TABLE "stores" ADD COLUMN "comment" text NULL;


-- ===========================================================
-- File: 2024_12_12_114152_add_module_type_col_to_subscription_package_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_12_12_114152_add_module_type_col_to_subscription_package_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "subscription_packages" ADD COLUMN "module_type" varchar(255) NOT NULL DEFAULT 'all';


-- ===========================================================
-- File: 2024_12_14_131104_add_module_type_to_notification_settings_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_12_14_131104_add_module_type_to_notification_settings_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "notification_settings" ADD COLUMN "module_type" varchar(255) NOT NULL DEFAULT 'all';


-- ===========================================================
-- File: 2024_12_24_112837_add_to_col_cash_backs_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_12_24_112837_add_to_col_cash_backs_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "cash_backs" ADD COLUMN "is_rental" boolean NOT NULL DEFAULT FALSE;


-- ===========================================================
-- File: 2024_12_31_170522_add_trip_id_col_to_expense_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2024_12_31_170522_add_trip_id_col_to_expense_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "expenses" ADD COLUMN "trip_id" bigint NULL;


-- ===========================================================
-- File: 2025_01_01_122538_add_trip_id_to_cash_back_histories.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_01_01_122538_add_trip_id_to_cash_back_histories.php
-- Auto-generated. Review before running on production.

ALTER TABLE "cash_back_histories" ADD COLUMN "trip_id" bigint NULL;


-- ===========================================================
-- File: 2025_01_05_140000_add_module_type_col_to_store_notification_settings_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_01_05_140000_add_module_type_col_to_store_notification_settings_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "store_notification_settings" ADD COLUMN "module_type" varchar(255) NOT NULL DEFAULT 'all';


-- ===========================================================
-- File: 2025_02_06_163705_add_temp_product_id_col_to__ecommerce_item_details.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_02_06_163705_add_temp_product_id_col_to__ecommerce_item_details.php
-- Auto-generated. Review before running on production.

ALTER TABLE "ecommerce_item_details" ADD COLUMN "temp_product_id" bigint NULL;


-- ===========================================================
-- File: 2025_03_09_102816_add_module_id_col_to_brands_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_03_09_102816_add_module_id_col_to_brands_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "brands" ADD COLUMN "module_id" bigint NULL;


-- ===========================================================
-- File: 2025_03_12_101638_create_recent_searches_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_03_12_101638_create_recent_searches_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "recent_searches" (
  "id" bigserial PRIMARY KEY,
  "user_id" bigint NULL,
  "module_id" bigint NULL,
  "user_type" varchar(255) NULL,
  "route_name" varchar(255) NULL,
  "route_uri" varchar(255) NULL,
  "route_full_url" varchar(255) NULL,
  "keyword" varchar(255) NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2025_05_26_115043_create_system_tax_setups_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_05_26_115043_create_system_tax_setups_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "system_tax_setups" (
  "id" bigserial PRIMARY KEY,
  "tax_type" varchar(255) NOT NULL DEFAULT 'order_wise',
  "country_code" varchar(255) NULL,
  "tax_payer" varchar(255) NULL DEFAULT 'vendor',
  "is_default" boolean NOT NULL DEFAULT FALSE,
  "is_active" boolean NOT NULL DEFAULT TRUE,
  "is_included" boolean NOT NULL DEFAULT FALSE,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2025_05_26_115643_create_taxes_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_05_26_115643_create_taxes_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "taxes" (
  "id" bigserial PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "tax_rate" numeric('tax_rate',23) NOT NULL DEFAULT 0,
  "country_code" varchar(255) NULL,
  "is_default" boolean NOT NULL DEFAULT FALSE,
  "is_active" boolean NOT NULL DEFAULT TRUE,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2025_05_26_120030_create_tax_additional_setups_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_05_26_120030_create_tax_additional_setups_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "tax_additional_setups" (
  "id" bigserial PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "system_tax_setup_id" bigint NULL,
  "is_active" boolean NOT NULL DEFAULT TRUE,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2025_05_26_120912_create_taxables_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_05_26_120912_create_taxables_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "taxables" (
  "id" bigserial PRIMARY KEY,
  "taxable_type" varchar(255) NOT NULL,
  "taxable_id" bigint NOT NULL,
  "tax_id" bigint NOT NULL,
  "system_tax_setup_id" bigint NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2025_05_26_121656_create_order_taxes_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_05_26_121656_create_order_taxes_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "order_taxes" (
  "id" bigserial PRIMARY KEY,
  "tax_name" varchar(255) NOT NULL,
  "tax_type" varchar(255) NOT NULL,
  "tax_on" varchar(255) NOT NULL,
  "tax_rate" numeric('tax_rate',23) NOT NULL DEFAULT 0,
  "tax_amount" numeric('tax_amount',23) NOT NULL DEFAULT 0,
  "before_tax_amount" numeric('before_tax_amount',23) NOT NULL DEFAULT 0,
  "after_tax_amount" numeric('after_tax_amount',23) NOT NULL DEFAULT 0,
  "tax_payer" varchar(255) NULL,
  "country_code" varchar(255) NULL,
  "order_id" bigint NULL,
  "order_type" varchar(255) NULL,
  "quantity" integer NULL DEFAULT 1,
  "tax_id" bigint NOT NULL,
  "taxable_id" bigint NULL,
  "taxable_type" varchar(255) NULL,
  "store_id" bigint NULL,
  "store_type" varchar(255) NULL,
  "system_tax_setup_id" bigint NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2025_06_01_125609_create_addon_categories_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_06_01_125609_create_addon_categories_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "addon_categories" (
  "id" bigserial PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "module_id" bigint NULL,
  "status" boolean NOT NULL DEFAULT 1,
  "slug" varchar(255) NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2025_06_01_130624_add_addon_category_id_col_to_add_ons_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_06_01_130624_add_addon_category_id_col_to_add_ons_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "add_ons" ADD COLUMN "addon_category_id" bigint NULL;


-- ===========================================================
-- File: 2025_06_14_154744_add_discount_data_on_order_details_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_06_14_154744_add_discount_data_on_order_details_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "order_details" ADD COLUMN "category_id" bigint NULL;
ALTER TABLE "order_details" ADD COLUMN "discount_on_product_by" varchar(255) NULL;
ALTER TABLE "order_details" ADD COLUMN "tax_status" varchar(255) NULL;
ALTER TABLE "order_details" ADD COLUMN "discount_percentage" numeric('discount_percentage',23) NULL DEFAULT 0;
ALTER TABLE "order_details" ADD COLUMN "addon_discount" numeric('addon_discount',23) NULL DEFAULT 0;


-- ===========================================================
-- File: 2025_06_25_174502_add_to_cols_stores_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_06_25_174502_add_to_cols_stores_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "stores" ADD COLUMN "tin" varchar(255) NULL;
ALTER TABLE "stores" ADD COLUMN "tin_expire_date" date NULL;
ALTER TABLE "stores" ADD COLUMN "tin_certificate_image" varchar(255) NULL;


-- ===========================================================
-- File: 2025_07_05_070056_add_tax_type_col_to_order_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_07_05_070056_add_tax_type_col_to_order_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "tax_type" varchar(255) NULL;


-- ===========================================================
-- File: 2025_07_13_160717_add_charge_type_col_to_module_zone_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_07_13_160717_add_charge_type_col_to_module_zone_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "module_zone" ADD COLUMN "delivery_charge_type" varchar CHECK ("delivery_charge_type" IN ('fixed', 'distance')) NOT NULL DEFAULT 'distance';
ALTER TABLE "module_zone" ADD COLUMN "fixed_shipping_charge" numeric('fixed_shipping_charge',23) NULL;


-- ===========================================================
-- File: 2025_07_13_185456_create_surge_prices_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_07_13_185456_create_surge_prices_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "surge_prices" (
  "id" bigserial PRIMARY KEY,
  "surge_price_name" varchar(255) NOT NULL,
  "customer_note" text NULL,
  "customer_note_status" boolean NOT NULL DEFAULT TRUE,
  "module_ids" jsonb NULL,
  "zone_id" bigint NOT NULL,
  "price" numeric('price',10) NOT NULL DEFAULT 0,
  "price_type" varchar CHECK ("price_type" IN ('amount', 'percent')) NOT NULL DEFAULT 'amount',
  "status" boolean NOT NULL DEFAULT TRUE,
  "is_permanent" boolean NOT NULL DEFAULT FALSE,
  "duration_type" varchar CHECK ("duration_type" IN ('daily', 'weekly', 'custom')) NOT NULL DEFAULT 'daily',
  "weekly_days" jsonb NULL,
  "custom_days" jsonb NULL,
  "custom_times" jsonb NULL,
  "start_date" date NULL,
  "end_date" date NULL,
  "start_time" time NULL,
  "end_time" time NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2025_07_13_192359_create_surge_price_dates_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_07_13_192359_create_surge_price_dates_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "surge_price_dates" (
  "id" bigserial PRIMARY KEY,
  "surge_price_id" bigint NOT NULL,
  "zone_id" bigint NOT NULL,
  "module_id" bigint NOT NULL,
  "status" boolean NOT NULL DEFAULT TRUE,
  "applicable_date" date NULL,
  "start_time" time NULL,
  "end_time" time NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2025_07_22_130717_add_login_remember_token_to_admins_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_07_22_130717_add_login_remember_token_to_admins_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "admins" ADD COLUMN "login_remember_token" varchar(255) NULL;


-- ===========================================================
-- File: 2025_07_22_130717_add_login_remember_token_to_vendor_employees_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_07_22_130717_add_login_remember_token_to_vendor_employees_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "vendor_employees" ADD COLUMN "login_remember_token" varchar(255) NULL;


-- ===========================================================
-- File: 2025_07_22_130717_add_login_remember_token_to_vendors_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_07_22_130717_add_login_remember_token_to_vendors_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "vendors" ADD COLUMN "login_remember_token" varchar(255) NULL;


-- ===========================================================
-- File: 2025_07_24_123609_add_index_to_items_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_07_24_123609_add_index_to_items_table.php
-- Auto-generated. Review before running on production.

CREATE INDEX IF NOT EXISTS "items_category_id_index" ON "items" ("category_id");
CREATE INDEX IF NOT EXISTS "items_store_id_index" ON "items" ("store_id");
CREATE INDEX IF NOT EXISTS "items_name_index" ON "items" ("name");
CREATE INDEX IF NOT EXISTS "items_slug_index" ON "items" ("slug");
CREATE INDEX IF NOT EXISTS "items_price_index" ON "items" ("price");
CREATE INDEX IF NOT EXISTS "items_created_at_index" ON "items" ("created_at");
CREATE INDEX IF NOT EXISTS "items_order_count_index" ON "items" ("order_count");
CREATE INDEX IF NOT EXISTS "items_avg_rating_index" ON "items" ("avg_rating");


-- ===========================================================
-- File: 2025_07_24_131029_add_index_to_reviews_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_07_24_131029_add_index_to_reviews_table.php
-- Auto-generated. Review before running on production.

CREATE INDEX IF NOT EXISTS "reviews_item_id_index" ON "reviews" ("item_id");
CREATE INDEX IF NOT EXISTS "reviews_item_campaign_id_index" ON "reviews" ("item_campaign_id");
CREATE INDEX IF NOT EXISTS "reviews_user_id_index" ON "reviews" ("user_id");
CREATE INDEX IF NOT EXISTS "reviews_order_id_index" ON "reviews" ("order_id");
CREATE INDEX IF NOT EXISTS "reviews_store_id_index" ON "reviews" ("store_id");
CREATE INDEX IF NOT EXISTS "reviews_review_id_index" ON "reviews" ("review_id");


-- ===========================================================
-- File: 2025_07_24_131340_add_index_to_wishlists_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_07_24_131340_add_index_to_wishlists_table.php
-- Auto-generated. Review before running on production.

CREATE INDEX IF NOT EXISTS "wishlists_user_id_index" ON "wishlists" ("user_id");
CREATE INDEX IF NOT EXISTS "wishlists_item_id_index" ON "wishlists" ("item_id");
CREATE INDEX IF NOT EXISTS "wishlists_store_id_index" ON "wishlists" ("store_id");


-- ===========================================================
-- File: 2025_07_27_152011_add_index_to_categories_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_07_27_152011_add_index_to_categories_table.php
-- Auto-generated. Review before running on production.

CREATE INDEX IF NOT EXISTS "categories_parent_id_index" ON "categories" ("parent_id");
CREATE INDEX IF NOT EXISTS "categories_name_index" ON "categories" ("name");


-- ===========================================================
-- File: 2025_09_15_143154_create_parcel_cancellation_reasons_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_09_15_143154_create_parcel_cancellation_reasons_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "parcel_cancellation_reasons" (
  "id" bigserial PRIMARY KEY,
  "reason" varchar(255) NOT NULL,
  "user_type" varchar CHECK ("user_type" IN ('customer', 'admin', 'deliveryman', 'vendor')) NOT NULL DEFAULT 'customer',
  "cancellation_type" varchar CHECK ("cancellation_type" IN ('before_pickup', 'after_pickup')) NOT NULL DEFAULT 'before_pickup',
  "status" smallint NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2025_09_16_173917_create_parcel_cancellations_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_09_16_173917_create_parcel_cancellations_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "parcel_cancellations" (
  "id" bigserial PRIMARY KEY,
  "order_id" bigint NOT NULL,
  "reason" text NULL,
  "cancel_by" varchar(255) NULL,
  "note" text NULL,
  "return_otp" varchar(255) NULL,
  "return_fee" double precision NULL DEFAULT 0,
  "return_fee_payment_status" varchar(255) NULL DEFAULT 'unpaid',
  "return_date" timestamp NULL,
  "dm_penalty_fee" double precision NULL DEFAULT 0,
  "before_pickup" boolean NOT NULL DEFAULT 1,
  "set_return_date" boolean NOT NULL DEFAULT 0,
  "is_delivery_charge_refundable" boolean NOT NULL DEFAULT 0,
  "is_refunded" boolean NOT NULL DEFAULT 0,
  "refund_amount" double precision NOT NULL DEFAULT 0,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2025_09_20_141407_add_bring_change_amount_col_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_09_20_141407_add_bring_change_amount_col_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "bring_change_amount" integer NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN "cancellation_note" text NULL;


-- ===========================================================
-- File: 2025_09_20_155910_create_analytic_scripts_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_09_20_155910_create_analytic_scripts_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "analytic_scripts" (
  "id" bigserial PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "type" varchar(255) NULL,
  "script_id" text NULL,
  "script" text NULL,
  "is_active" boolean NOT NULL DEFAULT 0,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2025_09_21_171906_add_section_wise_ai_use_count_to_store_configs.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_09_21_171906_add_section_wise_ai_use_count_to_store_configs.php
-- Auto-generated. Review before running on production.




-- ===========================================================
-- File: 2025_09_21_174228_add_sender_note_to_withdraw_requests.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_09_21_174228_add_sender_note_to_withdraw_requests.php
-- Auto-generated. Review before running on production.

ALTER TABLE "withdraw_requests" ADD COLUMN "sender_note" text NULL;


-- ===========================================================
-- File: 2025_09_25_181108_rename_bank_name_to_rejection_note_in_vendors_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_09_25_181108_rename_bank_name_to_rejection_note_in_vendors_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "vendors" ADD COLUMN "rejection_note" text NULL;


-- ===========================================================
-- File: 2025_10_23_160409_create_f_a_q_s_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_10_23_160409_create_f_a_q_s_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "f_a_q_s" (
  "id" bigserial PRIMARY KEY,
  "question" varchar(255) NOT NULL,
  "answer" text NOT NULL,
  "page_type" varchar(255) NULL,
  "user_type" varchar(255) NULL,
  "status" boolean NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2025_11_09_014948_create_page_seo_data_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_11_09_014948_create_page_seo_data_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "page_seo_data" (
  "id" bigserial PRIMARY KEY,
  "page_name" varchar(255) NOT NULL,
  "slug" varchar(255) NULL,
  "title" varchar(255) NOT NULL,
  "description" varchar(255) NOT NULL,
  "image" varchar(255) NULL,
  "meta_data" jsonb NULL,
  "status" boolean NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2025_11_27_132943_update_identity_image_column_in_delivery_men_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_11_27_132943_update_identity_image_column_in_delivery_men_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "delivery_men" ADD COLUMN "identity_image" text NOT NULL;
ALTER TABLE "delivery_men" ADD COLUMN "loyalty_point" numeric('loyalty_point',23) NULL DEFAULT 0;
ALTER TABLE "delivery_men" ADD COLUMN "ref_code" varchar(255) NULL;
ALTER TABLE "delivery_men" ADD COLUMN "ref_by" bigint NULL;


-- ===========================================================
-- File: 2025_11_27_141050_create_deliveryman_loyalty_point_histories_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_11_27_141050_create_deliveryman_loyalty_point_histories_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "deliveryman_loyalty_point_histories" (
  "id" bigserial PRIMARY KEY,
  "delivery_man_id" bigint NOT NULL,
  "transaction_id" uuid NOT NULL,
  "transaction_type" varchar(255) NOT NULL,
  "point_conversion_type" varchar(255) NOT NULL,
  "point" numeric('point',24) NOT NULL DEFAULT 0,
  "converted_amount" numeric('converted_amount',24) NOT NULL DEFAULT 0,
  "reference" varchar(255) NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2025_11_30_093640_create_deliveryman_referral_histories_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2025_11_30_093640_create_deliveryman_referral_histories_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "deliveryman_referral_histories" (
  "id" bigserial PRIMARY KEY,
  "delivery_man_id" bigint NOT NULL,
  "referrer_id" bigint NULL,
  "transaction_id" uuid NOT NULL,
  "refer_type" varchar(255) NOT NULL DEFAULT 'referral',
  "amount" numeric('amount',24) NOT NULL DEFAULT 0,
  "reference" varchar(255) NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2026_01_08_121542_add_meta_data_column_to_stores_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_01_08_121542_add_meta_data_column_to_stores_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "stores" ADD COLUMN "meta_data" jsonb NULL;


-- ===========================================================
-- File: 2026_01_08_150355_create_item_seo_data_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_01_08_150355_create_item_seo_data_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "item_seo_data" (
  "id" bigserial PRIMARY KEY,
  "item_id" bigint NULL,
  "temp_item_id" bigint NULL,
  "title" varchar(255) NULL,
  "description" varchar(255) NULL,
  "image" varchar(255) NULL,
  "meta_data" jsonb NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2026_01_12_101427_add_is_default_col_to_zones_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_01_12_101427_add_is_default_col_to_zones_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "zones" ADD COLUMN "is_default" boolean NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2026_01_21_103359_add_slug_to_modules_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_01_21_103359_add_slug_to_modules_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "modules" ADD COLUMN "slug" varchar(255) NULL;


-- ===========================================================
-- File: 2026_01_21_112637_add_slug_column_to_campaigns_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_01_21_112637_add_slug_column_to_campaigns_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "campaigns" ADD COLUMN "slug" varchar(255) NULL;


-- ===========================================================
-- File: 2026_01_27_141523_create_parcel_return_fees_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_01_27_141523_create_parcel_return_fees_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "parcel_return_fees" (
  "id" bigserial PRIMARY KEY,
  "transaction_id" varchar(255) NULL,
  "delivery_man_id" bigint NULL,
  "user_id" bigint NOT NULL,
  "order_id" bigint NOT NULL,
  "amount" numeric('amount',10) NOT NULL DEFAULT 0,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2026_01_27_141620_create_parcel_penalty_fees_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_01_27_141620_create_parcel_penalty_fees_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "parcel_penalty_fees" (
  "id" bigserial PRIMARY KEY,
  "transaction_id" varchar(255) NULL,
  "delivery_man_id" bigint NOT NULL,
  "order_id" bigint NOT NULL,
  "amount" numeric('amount',10) NOT NULL DEFAULT 0,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2026_02_04_152345_add_ride_related_columns_in_d_m_vehicles_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_02_04_152345_add_ride_related_columns_in_d_m_vehicles_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "d_m_vehicles" ADD COLUMN "name" varchar(255) NULL;
ALTER TABLE "d_m_vehicles" ADD COLUMN "description" text NULL;
ALTER TABLE "d_m_vehicles" ADD COLUMN "image" varchar(255) NULL;
ALTER TABLE "d_m_vehicles" ADD COLUMN "is_delivery" boolean NOT NULL DEFAULT 1;
ALTER TABLE "d_m_vehicles" ADD COLUMN "is_ride" boolean NOT NULL DEFAULT 0;
ALTER TABLE "d_m_vehicles" ADD COLUMN "starting_coverage_area" numeric('starting_coverage_area',16) NOT NULL DEFAULT 0;
ALTER TABLE "d_m_vehicles" ADD COLUMN "maximum_coverage_area" numeric('maximum_coverage_area',16) NOT NULL DEFAULT 0;
ALTER TABLE "d_m_vehicles" ADD COLUMN "extra_charges" numeric('extra_charges',16) NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2026_02_04_164604_add_question_column_in_automated_messages_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_02_04_164604_add_question_column_in_automated_messages_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "automated_messages" ADD COLUMN "question_for" varchar(255) NOT NULL DEFAULT CUSTOMER;
ALTER TABLE "automated_messages" ADD COLUMN "question" varchar(255) NOT NULL;


-- ===========================================================
-- File: 2026_02_04_165904_add_user_note_col_to_withdraw_requests_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_02_04_165904_add_user_note_col_to_withdraw_requests_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "withdraw_requests" ADD COLUMN "user_note" varchar(255) NULL;


-- ===========================================================
-- File: 2026_02_08_113515_add_rider_wise_topic_to_zones_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_02_08_113515_add_rider_wise_topic_to_zones_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "zones" ADD COLUMN "rider_wise_topic" varchar(255) NULL;


-- ===========================================================
-- File: 2026_03_09_151700_add_extra_discount_amount_col_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_03_09_151700_add_extra_discount_amount_col_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "extra_discount_amount" numeric('extra_discount_amount',10) NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2026_03_25_171011_add_timestamps_to_campaign_store_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_03_25_171011_add_timestamps_to_campaign_store_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "campaign_store" ADD COLUMN "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "campaign_store" ADD COLUMN "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP;


-- ===========================================================
-- File: 2026_04_06_000001_add_verified_seller_to_store_configs_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_04_06_000001_add_verified_seller_to_store_configs_table.php
-- Auto-generated. Review before running on production.




-- ===========================================================
-- File: 2026_04_07_000001_create_user_files_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_04_07_000001_create_user_files_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "user_files" (
  "id" bigserial PRIMARY KEY,
  "user_id" bigint NOT NULL,
  "file_name" varchar(255) NOT NULL,
  "storage" varchar(255) NOT NULL DEFAULT 'public',
  "mime_type" varchar(255) NULL,
  "type" varchar(255) NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2026_04_07_160000_create_reels_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_04_07_160000_create_reels_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "reels" ADD CONSTRAINT fk_reels_store_id FOREIGN KEY ("store_id") REFERENCES "store"(id) ON DELETE CASCADE;
CREATE TABLE IF NOT EXISTS "reels" (
  "id" bigserial PRIMARY KEY,
  "store_id" bigint NOT NULL,
  "module_id" bigint NOT NULL,
  "module_type" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "thumbnail" varchar(255) NULL,
  "video" varchar(255) NULL,
  "is_always_visible" boolean NOT NULL DEFAULT FALSE,
  "start_date" timestamp NULL,
  "end_date" timestamp NULL,
  "status" boolean NOT NULL DEFAULT TRUE,
  "total_views" bigint NOT NULL DEFAULT 0,
  "total_likes" bigint NOT NULL DEFAULT 0,
  "total_store_visits" bigint NOT NULL DEFAULT 0,
  "created_by_id" bigint NULL,
  "created_by_type" varchar(255) NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2026_04_08_000001_create_reel_engagements_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_04_08_000001_create_reel_engagements_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "reel_engagements" ADD CONSTRAINT fk_reel_engagements_reel_id FOREIGN KEY ("reel_id") REFERENCES "reels"(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS "reel_engagements_reel_id_user_id_guest_id_type_index" ON "reel_engagements" ("reel_id", "user_id", "guest_id", "type");
CREATE UNIQUE INDEX IF NOT EXISTS "reel_engagements_reel_id_user_id_type_unique" ON "reel_engagements" ("reel_id", "user_id", "type");
CREATE UNIQUE INDEX IF NOT EXISTS "reel_engagements_reel_id_guest_id_type_unique" ON "reel_engagements" ("reel_id", "guest_id", "type");
CREATE TABLE IF NOT EXISTS "reel_engagements" (
  "id" bigserial PRIMARY KEY,
  "reel_id" bigint NOT NULL,
  "user_id" bigint NULL,
  "guest_id" varchar(255) NULL,
  "type" varchar(255) NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2026_04_13_000001_add_product_video_columns_to_items_and_temp_products_tables.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_04_13_000001_add_product_video_columns_to_items_and_temp_products_tables.php
-- Auto-generated. Review before running on production.

ALTER TABLE "items" ADD COLUMN "video" varchar(255) NULL;
ALTER TABLE "items" ADD COLUMN "video_link" text NULL;
ALTER TABLE "temp_products" ADD COLUMN "video" varchar(255) NULL;
ALTER TABLE "temp_products" ADD COLUMN "video_link" text NULL;


-- ===========================================================
-- File: 2026_04_13_120000_add_show_low_stock_count_to_store_configs_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_04_13_120000_add_show_low_stock_count_to_store_configs_table.php
-- Auto-generated. Review before running on production.




-- ===========================================================
-- File: 2026_04_16_140158_add_ride_id_col_to_expenses_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_04_16_140158_add_ride_id_col_to_expenses_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "expenses" ADD COLUMN "ride_id" bigint NULL;


-- ===========================================================
-- File: 2026_04_30_152616_add_website_builder_status_column_to_store_configs_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_04_30_152616_add_website_builder_status_column_to_store_configs_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "store_configs" ADD COLUMN "website_builder_status" integer NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2026_05_12_120000_add_tenant_scope_to_auth_tables.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_05_12_120000_add_tenant_scope_to_auth_tables.php
-- Auto-generated. Review before running on production.




-- ===========================================================
-- File: 2026_05_13_000000_add_store_id_to_carts_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_05_13_000000_add_store_id_to_carts_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "carts" ADD CONSTRAINT fk_carts_store_id FOREIGN KEY ("store_id") REFERENCES "stores"(id) ON DELETE CASCADE;
ALTER TABLE "carts" ADD COLUMN "store_id" bigint NULL;


-- ===========================================================
-- File: 2026_05_13_000001_add_additional_delivery_option_columns_to_module_zone_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_05_13_000001_add_additional_delivery_option_columns_to_module_zone_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "module_zone" ADD COLUMN "additional_delivery_option_status" boolean NOT NULL DEFAULT 0;
ALTER TABLE "module_zone" ADD COLUMN "minimum_delivery_time" integer NULL;
ALTER TABLE "module_zone" ADD COLUMN "minimum_delivery_charge" numeric('minimum_delivery_charge',10) NULL;


-- ===========================================================
-- File: 2026_05_13_000002_create_module_zone_delivery_options_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_05_13_000002_create_module_zone_delivery_options_table.php
-- Auto-generated. Review before running on production.

CREATE UNIQUE INDEX IF NOT EXISTS "module_zone_delivery_options_module_id_zone_id_delivery_type_unique" ON "module_zone_delivery_options" ("module_id", "zone_id", "delivery_type");
CREATE INDEX IF NOT EXISTS "module_zone_delivery_options_module_id_zone_id_index" ON "module_zone_delivery_options" ("module_id", "zone_id");
CREATE TABLE IF NOT EXISTS "module_zone_delivery_options" (
  "id" bigserial PRIMARY KEY,
  "module_id" bigint NOT NULL,
  "zone_id" bigint NOT NULL,
  "delivery_type" varchar CHECK ("delivery_type" IN ('standard', 'express', 'slightly_delay')) NOT NULL DEFAULT 'standard',
  "extra_charge" numeric('extra_charge',10) NULL,
  "reduce_charge" numeric('reduce_charge',10) NULL,
  "add_delivery_time" integer NULL,
  "reduce_delivery_time" integer NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2026_05_13_000003_add_delivery_type_columns_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_05_13_000003_add_delivery_type_columns_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "delivery_type" varchar(255) NULL;
ALTER TABLE "orders" ADD COLUMN "delivery_type_charge" numeric('delivery_type_charge',10) NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS "orders_delivery_type_index" ON "orders" ("delivery_type");


-- ===========================================================
-- File: 2026_05_13_100000_create_pro_customer_subscription_plans_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_05_13_100000_create_pro_customer_subscription_plans_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "pro_customer_subscription_plans" (
  "id" bigserial PRIMARY KEY,
  "plan_name" varchar(255) NOT NULL,
  "plan_type" varchar CHECK ("plan_type" IN ('free_trial', 'paid')) NOT NULL DEFAULT 'paid',
  "price" numeric('price',24) NOT NULL DEFAULT 0,
  "duration" integer NOT NULL DEFAULT 0,
  "status" boolean NOT NULL DEFAULT TRUE,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2026_05_13_100001_create_pro_customer_faqs_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_05_13_100001_create_pro_customer_faqs_table.php
-- Auto-generated. Review before running on production.

CREATE TABLE IF NOT EXISTS "pro_customer_faqs" (
  "id" bigserial PRIMARY KEY,
  "question" varchar(255) NOT NULL,
  "answer" text NOT NULL,
  "priority" integer NOT NULL DEFAULT 0,
  "status" boolean NOT NULL DEFAULT TRUE,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2026_05_13_100002_add_pro_status_to_users_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_05_13_100002_add_pro_status_to_users_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "users" ADD COLUMN "pro_status" boolean NOT NULL DEFAULT FALSE;


-- ===========================================================
-- File: 2026_05_13_100003_create_pro_customer_subscriptions_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_05_13_100003_create_pro_customer_subscriptions_table.php
-- Auto-generated. Review before running on production.

CREATE INDEX IF NOT EXISTS "pro_customer_subscriptions_user_id_status_index" ON "pro_customer_subscriptions" ("user_id", "status");
CREATE INDEX IF NOT EXISTS "pro_customer_subscriptions_plan_id_index" ON "pro_customer_subscriptions" ("plan_id");
CREATE INDEX IF NOT EXISTS "pro_customer_subscriptions_end_at_index" ON "pro_customer_subscriptions" ("end_at");
CREATE TABLE IF NOT EXISTS "pro_customer_subscriptions" (
  "id" bigserial PRIMARY KEY,
  "user_id" bigint NOT NULL,
  "plan_id" bigint NULL,
  "plan_name" varchar(255) NOT NULL,
  "plan_type" varchar CHECK ("plan_type" IN ('free_trial', 'paid')) NOT NULL DEFAULT 'paid',
  "plan_price" numeric('plan_price',24) NOT NULL DEFAULT 0,
  "start_at" timestamp NOT NULL,
  "end_at" timestamp NOT NULL,
  "status" varchar CHECK ("status" IN ('active', 'expired', 'canceled')) NOT NULL DEFAULT 'active',
  "auto_renew" boolean NOT NULL DEFAULT FALSE,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2026_05_13_100004_create_pro_customer_transactions_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_05_13_100004_create_pro_customer_transactions_table.php
-- Auto-generated. Review before running on production.

CREATE INDEX IF NOT EXISTS "pro_customer_transactions_user_id_index" ON "pro_customer_transactions" ("user_id");
CREATE INDEX IF NOT EXISTS "pro_customer_transactions_subscription_id_index" ON "pro_customer_transactions" ("subscription_id");
CREATE INDEX IF NOT EXISTS "pro_customer_transactions_plan_id_index" ON "pro_customer_transactions" ("plan_id");
CREATE INDEX IF NOT EXISTS "pro_customer_transactions_transaction_reference_index" ON "pro_customer_transactions" ("transaction_reference");
CREATE INDEX IF NOT EXISTS "pro_customer_transactions_payment_method_index" ON "pro_customer_transactions" ("payment_method");
CREATE INDEX IF NOT EXISTS "pro_customer_transactions_payment_status_index" ON "pro_customer_transactions" ("payment_status");
CREATE INDEX IF NOT EXISTS "pro_customer_transactions_paid_at_index" ON "pro_customer_transactions" ("paid_at");
CREATE TABLE IF NOT EXISTS "pro_customer_transactions" (
  "id" bigserial PRIMARY KEY,
  "user_id" bigint NOT NULL,
  "subscription_id" bigint NULL,
  "plan_id" bigint NULL,
  "transaction_reference" varchar(255) NULL,
  "plan_name" varchar(255) NOT NULL,
  "plan_type" varchar CHECK ("plan_type" IN ('free_trial', 'paid')) NOT NULL DEFAULT 'paid',
  "plan_price" numeric('plan_price',24) NOT NULL DEFAULT 0,
  "amount" numeric('amount',24) NOT NULL DEFAULT 0,
  "payment_method" varchar(255) NULL,
  "payment_status" varchar CHECK ("payment_status" IN ('success', 'pending', 'failed', 'refunded')) NOT NULL DEFAULT 'pending',
  "start_at" timestamp NULL,
  "end_at" timestamp NULL,
  "order_count" integer NOT NULL DEFAULT 0,
  "paid_at" timestamp NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2026_05_13_100005_create_order_pro_discounts_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_05_13_100005_create_order_pro_discounts_table.php
-- Auto-generated. Review before running on production.

CREATE INDEX IF NOT EXISTS "order_pro_discounts_order_id_index" ON "order_pro_discounts" ("order_id");
CREATE INDEX IF NOT EXISTS "order_pro_discounts_user_id_index" ON "order_pro_discounts" ("user_id");
CREATE INDEX IF NOT EXISTS "order_pro_discounts_subscription_id_index" ON "order_pro_discounts" ("subscription_id");
CREATE INDEX IF NOT EXISTS "order_pro_discounts_transaction_id_index" ON "order_pro_discounts" ("transaction_id");
CREATE INDEX IF NOT EXISTS "order_pro_discounts_plan_id_index" ON "order_pro_discounts" ("plan_id");
CREATE INDEX IF NOT EXISTS "order_pro_discounts_benefit_type_index" ON "order_pro_discounts" ("benefit_type");
CREATE TABLE IF NOT EXISTS "order_pro_discounts" (
  "id" bigserial PRIMARY KEY,
  "order_id" bigint NOT NULL,
  "user_id" integer NOT NULL,
  "subscription_id" bigint NULL,
  "transaction_id" bigint NULL,
  "plan_id" bigint NULL,
  "benefit_type" varchar CHECK ("benefit_type" IN ('discount', 'delivery_fee', 'coupon')) NOT NULL,
  "amount_saved" numeric('amount_saved',24) NOT NULL DEFAULT 0,
  "discount_percentage" numeric('discount_percentage',8) NULL,
  "max_discount_amount" numeric('max_discount_amount',24) NULL,
  "min_order_amount" numeric('min_order_amount',24) NULL,
  "delivery_offer_type" varchar(255) NULL,
  "delivery_charge_discount_percentage" numeric('delivery_charge_discount_percentage',8) NULL,
  "delivery_fee_reduction_amount" numeric('delivery_fee_reduction_amount',24) NULL,
  "original_delivery_charge" numeric('original_delivery_charge',24) NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2026_05_14_173407_add_can_edit_order_column_to_store_configs_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_05_14_173407_add_can_edit_order_column_to_store_configs_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "store_configs" ADD COLUMN "can_edit_order" boolean NOT NULL DEFAULT FALSE;


-- ===========================================================
-- File: 2026_05_16_000001_create_pro_customer_benefit_settings_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_05_16_000001_create_pro_customer_benefit_settings_table.php
-- Auto-generated. Review before running on production.

CREATE UNIQUE INDEX IF NOT EXISTS "pro_customer_benefit_settings_benefit_type_module_type_unique" ON "pro_customer_benefit_settings" ("benefit_type", "module_type");
CREATE TABLE IF NOT EXISTS "pro_customer_benefit_settings" (
  "id" bigserial PRIMARY KEY,
  "benefit_type" varchar(255) NOT NULL,
  "module_type" varchar(255) NULL,
  "settings" jsonb NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2026_05_20_120000_add_unit_value_col_to_pharmacy_item_details_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_05_20_120000_add_unit_value_col_to_pharmacy_item_details_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "pharmacy_item_details" ADD COLUMN "unit_value" varchar(255) NULL;


-- ===========================================================
-- File: 2026_05_20_120100_add_manufacturer_col_to_pharmacy_item_details_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_05_20_120100_add_manufacturer_col_to_pharmacy_item_details_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "pharmacy_item_details" ADD COLUMN "manufacturer" varchar(255) NULL;


-- ===========================================================
-- File: 2026_05_21_000001_add_pro_discount_cols_to_order_transactions_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_05_21_000001_add_pro_discount_cols_to_order_transactions_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "order_transactions" ADD COLUMN "pro_discount" numeric('pro_discount',23) NOT NULL DEFAULT 0;
ALTER TABLE "order_transactions" ADD COLUMN "pro_delivery_discount" numeric('pro_delivery_discount',23) NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2026_05_21_000001_create_search_logs_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_05_21_000001_create_search_logs_table.php
-- Auto-generated. Review before running on production.

CREATE INDEX IF NOT EXISTS "search_logs_module_id_zone_id_created_at_index" ON "search_logs" ("module_id", "zone_id", "created_at");
CREATE INDEX IF NOT EXISTS "search_logs_keyword_module_id_zone_id_index" ON "search_logs" ("keyword", "module_id", "zone_id");
CREATE TABLE IF NOT EXISTS "search_logs" (
  "id" bigserial PRIMARY KEY,
  "keyword" varchar(255) NOT NULL,
  "user_id" bigint NULL,
  "guest_id" varchar(255) NULL,
  "module_id" integer NOT NULL,
  "zone_id" varchar(255) NOT NULL,
  "result_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2026_05_22_101207_create_monthly_order_reminders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_05_22_101207_create_monthly_order_reminders_table.php
-- Auto-generated. Review before running on production.

CREATE INDEX IF NOT EXISTS "monthly_order_reminders_remind_at_status_index" ON "monthly_order_reminders" ("remind_at", "status");
CREATE INDEX IF NOT EXISTS "monthly_order_reminders_user_id_order_id_index" ON "monthly_order_reminders" ("user_id", "order_id");
CREATE TABLE IF NOT EXISTS "monthly_order_reminders" (
  "id" bigserial PRIMARY KEY,
  "user_id" bigint NULL,
  "order_id" bigint NULL,
  "module_id" integer NULL,
  "module_type" varchar(255) NULL,
  "zone_id" varchar(255) NULL,
  "remind_at" date NULL,
  "dispatched_at" timestamp NULL,
  "notified_at" timestamp NULL,
  "status" varchar CHECK ("status" IN ('pending', 'sent', 'cancelled')) NOT NULL DEFAULT 'pending',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2026_05_22_170000_create_smart_banners_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_05_22_170000_create_smart_banners_table.php
-- Auto-generated. Review before running on production.

CREATE INDEX IF NOT EXISTS "smart_banners_zone_id_status_index" ON "smart_banners" ("zone_id", "status");
CREATE INDEX IF NOT EXISTS "smart_banners_zone_id_position_start_date_end_date_index" ON "smart_banners" ("zone_id", "position", "start_date", "end_date");
CREATE INDEX IF NOT EXISTS "smart_banners_redirect_type_redirect_target_id_index" ON "smart_banners" ("redirect_type", "redirect_target_id");
CREATE TABLE IF NOT EXISTS "smart_banners" (
  "id" bigserial PRIMARY KEY,
  "zone_id" bigint NOT NULL,
  "module_id" bigint NULL,
  "active_days" varchar CHECK ("active_days" IN ('everyday', 'custom_date')) NOT NULL DEFAULT 'custom_date',
  "start_date" date NULL,
  "end_date" date NULL,
  "start_time" time NULL,
  "end_time" time NULL,
  "position" varchar(255) NOT NULL DEFAULT 'top',
  "redirect_type" varchar CHECK ("redirect_type" IN ('category', 'module_home', 'store_page', 'offer_page')) NOT NULL DEFAULT 'category',
  "redirect_target_id" bigint NULL,
  "image" varchar(255) NULL,
  "status" boolean NOT NULL DEFAULT TRUE,
  "created_by" varchar(255) NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2026_06_01_000001_add_trip_and_ride_request_to_order_pro_discounts_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_06_01_000001_add_trip_and_ride_request_to_order_pro_discounts_table.php
-- Auto-generated. Review before running on production.

CREATE INDEX IF NOT EXISTS "order_pro_discounts_trip_id_index" ON "order_pro_discounts" ("trip_id");
CREATE INDEX IF NOT EXISTS "order_pro_discounts_ride_request_id_index" ON "order_pro_discounts" ("ride_request_id");
ALTER TABLE "order_pro_discounts" ADD COLUMN "order_id" bigint NULL;
ALTER TABLE "order_pro_discounts" ADD COLUMN "trip_id" bigint NULL;
ALTER TABLE "order_pro_discounts" ADD COLUMN "ride_request_id" bigint NULL;


-- ===========================================================
-- File: 2026_06_04_162817_add_join_as_col_to_delivery_men_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_06_04_162817_add_join_as_col_to_delivery_men_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "delivery_men" ADD COLUMN "is_delivery" boolean NOT NULL DEFAULT 1;
ALTER TABLE "delivery_men" ADD COLUMN "is_ride" boolean NOT NULL DEFAULT 0;
ALTER TABLE "delivery_men" ADD COLUMN "earning" boolean NULL;


-- ===========================================================
-- File: 2026_06_11_000001_add_short_description_to_modules_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_06_11_000001_add_short_description_to_modules_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "modules" ADD COLUMN "short_description" varchar(255) NULL;


-- ===========================================================
-- File: 2026_06_17_000001_add_order_fields_to_reels_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_06_17_000001_add_order_fields_to_reels_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "reels" ADD COLUMN "productable_id" bigint NULL;
ALTER TABLE "reels" ADD COLUMN "productable_type" varchar(255) NULL;
ALTER TABLE "reels" ADD COLUMN "order_now_button" boolean NOT NULL DEFAULT FALSE;
ALTER TABLE "reels" ADD COLUMN "order_count" bigint NOT NULL DEFAULT 0;
ALTER TABLE "reels" ADD COLUMN "total_sale_amount" numeric('total_sale_amount',12) NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2026_06_17_000002_add_amount_to_reel_engagements_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_06_17_000002_add_amount_to_reel_engagements_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "reel_engagements" ADD COLUMN "amount" numeric('amount',12) NULL;


-- ===========================================================
-- File: 2026_06_17_000003_add_reel_id_to_carts_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_06_17_000003_add_reel_id_to_carts_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "carts" ADD COLUMN "reel_id" bigint NULL;


-- ===========================================================
-- File: 2026_06_18_000001_add_is_hidden_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_06_18_000001_add_is_hidden_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "is_hidden" boolean NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2026_07_12_000001_create_store_categories_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_07_12_000001_create_store_categories_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "store_categories" ADD CONSTRAINT fk_store_categories_store_id FOREIGN KEY ("store_id") REFERENCES "stores"(id) ON DELETE CASCADE;
CREATE TABLE IF NOT EXISTS "store_categories" (
  "id" bigserial PRIMARY KEY,
  "store_id" bigint NULL,
  "name" varchar(255) NOT NULL,
  "slug" varchar(255) NULL,
  "image" varchar(255) NULL,
  "priority" smallint NOT NULL DEFAULT 0,
  "status" smallint NOT NULL DEFAULT 1,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2026_07_12_000002_add_store_category_id_to_items_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_07_12_000002_add_store_category_id_to_items_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "items" ADD COLUMN "store_category_id" bigint NOT NULL;


-- ===========================================================
-- File: 2026_07_12_000004_add_store_category_id_to_temp_products_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_07_12_000004_add_store_category_id_to_temp_products_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "temp_products" ADD COLUMN "store_category_id" bigint NOT NULL;


-- ===========================================================
-- File: 2026_07_12_000005_add_module_id_to_store_categories_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_07_12_000005_add_module_id_to_store_categories_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "store_categories" ADD CONSTRAINT fk_store_categories_module_id FOREIGN KEY ("module_id") REFERENCES "modules"(id) ON DELETE CASCADE;
ALTER TABLE "store_categories" ADD COLUMN "module_id" bigint NULL;


-- ===========================================================
-- File: 2026_07_13_000001_add_edited_columns_to_orders_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_07_13_000001_add_edited_columns_to_orders_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "orders" ADD COLUMN "edited" boolean NOT NULL DEFAULT FALSE;
ALTER TABLE "orders" ADD COLUMN "adjusment" numeric('adjusment',24) NOT NULL DEFAULT 0;


-- ===========================================================
-- File: 2026_07_13_000002_create_order_edit_logs_table.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_07_13_000002_create_order_edit_logs_table.php
-- Auto-generated. Review before running on production.

ALTER TABLE "order_edit_logs" ADD CONSTRAINT fk_order_edit_logs_order_id FOREIGN KEY ("order_id") REFERENCES "orders"(id) ON DELETE CASCADE;
CREATE TABLE IF NOT EXISTS "order_edit_logs" (
  "id" bigserial PRIMARY KEY,
  "order_id" bigint NOT NULL,
  "log" varchar(255) NULL,
  "edited_by" varchar CHECK ("edited_by" IN ('customer', 'admin', 'vendor', 'delivery_man')) NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================================
-- File: 2026_07_14_000002_add_dashboard_indexes_to_tables.sql
-- ===========================================================
-- Converted from Laravel migration: 2026_07_14_000002_add_dashboard_indexes_to_tables.php
-- Auto-generated. Review before running on production.





-- Create admin user record (initial setup)
INSERT INTO "users" ("name", "email", "phone", "password", "is_active", "created_at", "updated_at")
VALUES ('Super Admin', 'admin@example.com', '0000000000', '$2a$12$N9qo8uLOickgx2ZMRZoMy.MrqK3b8/8mGv8pQzjHmJgQzH3gGv8aK', TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

COMMIT;

-- ===== END init.sql =====



-- ===== BEGIN seed_demo.sql (V4 - dynamic SQL, all user types) =====
-- =====================================================================
-- 6amMart — Comprehensive Demo Seed (V4)
-- =====================================================================
-- This section creates ALL demo users + demo data.
--
-- Uses dynamic SQL for auth.users (works on any Supabase version):
--   - 2 Admins:      admin1@example.com / admin123  (Rahul Sharma)
--                    admin2@example.com / admin456  (Priya Verma)
--   - 3 Customers:   customer1@demo.com / Customer@1234
--                    customer2@demo.com / Customer@1234
--                    customer3@demo.com / Customer@1234
--   - 3 Restaurant Owners: vendor1@demo.com / Vendor@1234
--                    vendor2@demo.com / Vendor@1234
--                    vendor3@demo.com / Vendor@1234
--   - 3 Delivery Boys:     dm1@demo.com / Delivery@1234
--                    dm2@demo.com / Delivery@1234
--                    dm3@demo.com / Delivery@1234
--
-- Plus demo data: modules, zones, stores, categories, items, orders,
-- banners, coupons, delivery men, etc.
-- =====================================================================


-- ---------------------------------------------------------------------
-- PART 1: Helper function — create_auth_user()
-- ---------------------------------------------------------------------
-- Creates an auth.users row using dynamic SQL (auto-detects which
-- columns exist on your Supabase version). Bypasses email confirmation.

CREATE OR REPLACE FUNCTION public.create_auth_user(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'customer'
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_encrypted_pw TEXT := crypt(p_password, gen_salt('bf', 12));
  v_existing_id UUID;
  v_col_name TEXT;
  v_col_value TEXT;
  v_cols TEXT := '';
  v_vals TEXT := '';
  v_sql TEXT;
  v_meta jsonb := jsonb_build_object('name', p_name, 'role', p_role);
  v_id_cols TEXT := '';
  v_id_vals TEXT := '';
  v_id_col_name TEXT;
  v_id_col_value TEXT;
  v_id_sql TEXT;
BEGIN
  -- Check if user already exists
  SELECT id INTO v_existing_id FROM auth.users WHERE email = p_email;
  IF v_existing_id IS NOT NULL THEN
    v_encrypted_pw := crypt(p_password, gen_salt('bf', 12));
    UPDATE auth.users SET
      encrypted_password = v_encrypted_pw,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || v_meta,
      updated_at = NOW()
    WHERE id = v_existing_id;

    -- Ensure an auth.identities row exists (GoTrue requires it on newer Supabase)
    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_existing_id) THEN
      BEGIN
        INSERT INTO auth.identities (user_id, identity_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
        VALUES (v_existing_id, v_existing_id::text, 'email',
          jsonb_build_object('sub', v_existing_id::text, 'email', p_email, 'email_verified', true),
          NOW(), NOW(), NOW());
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'identities insert (existing user) skipped: %', SQLERRM;
      END;
    END IF;

    RETURN v_existing_id;
  END IF;

  -- Build the INSERT column-by-column, only including columns that exist
  FOR v_col_name IN
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'auth' AND table_name = 'users'
    ORDER BY ordinal_position
  LOOP
    v_col_value := CASE v_col_name
      WHEN 'id' THEN quote_literal(v_user_id::text)
      WHEN 'instance_id' THEN quote_literal('00000000-0000-0000-0000-000000000000')
      WHEN 'aud' THEN quote_literal('authenticated')
      WHEN 'role' THEN quote_literal('authenticated')
      WHEN 'email' THEN quote_literal(p_email)
      WHEN 'encrypted_password' THEN quote_literal(v_encrypted_pw)
      WHEN 'email_confirmed_at' THEN 'NOW()'
      WHEN 'raw_app_meta_data' THEN quote_literal('{"provider":"email","providers":["email"]}') || '::jsonb'
      WHEN 'raw_user_meta_data' THEN quote_literal(v_meta::text) || '::jsonb'
      WHEN 'app_metadata' THEN quote_literal('{"provider":"email","providers":["email"]}') || '::jsonb'
      WHEN 'user_metadata' THEN quote_literal(v_meta::text) || '::jsonb'
      WHEN 'created_at' THEN 'NOW()'
      WHEN 'updated_at' THEN 'NOW()'
      WHEN 'is_sso_user' THEN 'FALSE'
      WHEN 'is_anonymous' THEN 'FALSE'
      WHEN 'phone' THEN 'NULL'
      WHEN 'phone_confirmed_at' THEN 'NULL'
      WHEN 'email_change' THEN quote_literal('')
      WHEN 'banned_until' THEN 'NULL'
      WHEN 'banned_reason' THEN 'NULL'
      WHEN 'deleted_at' THEN 'NULL'
      ELSE 'NULL'
    END;

    IF v_cols = '' THEN
      v_cols := v_col_name;
      v_vals := v_col_value;
    ELSE
      v_cols := v_cols || ', ' || v_col_name;
      v_vals := v_vals || ', ' || v_col_value;
    END IF;
  END LOOP;

  v_sql := 'INSERT INTO auth.users (' || v_cols || ') VALUES (' || v_vals || ')';
  EXECUTE v_sql;

  -- Insert matching auth.identities row — dynamic column detection so it
  -- works on both older (id, user_id, identity_id, ...) and newer (also has
  -- `email` NOT NULL column) Supabase auth.identities schemas.
  FOR v_id_col_name IN
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'auth' AND table_name = 'identities'
    ORDER BY ordinal_position
  LOOP
    v_id_col_value := CASE v_id_col_name
      WHEN 'id' THEN quote_literal(gen_random_uuid()::text)
      WHEN 'user_id' THEN quote_literal(v_user_id::text)
      WHEN 'identity_id' THEN quote_literal(v_user_id::text)
      WHEN 'identity_data' THEN quote_literal(jsonb_build_object(
        'sub', v_user_id::text,
        'email', p_email,
        'email_verified', true
      )::text) || '::jsonb'
      WHEN 'provider' THEN quote_literal('email')
      WHEN 'last_sign_in_at' THEN 'NOW()'
      WHEN 'created_at' THEN 'NOW()'
      WHEN 'updated_at' THEN 'NOW()'
      WHEN 'email' THEN quote_literal(p_email)
      ELSE 'NULL'
    END;

    IF v_id_cols = '' THEN
      v_id_cols := v_id_col_name;
      v_id_vals := v_id_col_value;
    ELSE
      v_id_cols := v_id_cols || ', ' || v_id_col_name;
      v_id_vals := v_id_vals || ', ' || v_id_col_value;
    END IF;
  END LOOP;

  IF v_id_cols <> '' THEN
    v_id_sql := 'INSERT INTO auth.identities (' || v_id_cols || ') VALUES (' || v_id_vals || ')';
    BEGIN
      EXECUTE v_id_sql;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'auth.identities insert skipped: %', SQLERRM;
    END;
  END IF;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ---------------------------------------------------------------------
-- PART 2: Create all demo users
-- ---------------------------------------------------------------------

DO $$
DECLARE
  -- Admins
  v_admin1_uuid UUID;
  v_admin2_uuid UUID;
  -- Customers
  v_cust1_uuid UUID;
  v_cust2_uuid UUID;
  v_cust3_uuid UUID;
  -- Vendors
  v_vendor1_uuid UUID;
  v_vendor2_uuid UUID;
  v_vendor3_uuid UUID;
  -- Delivery men
  v_dm1_uuid UUID;
  v_dm2_uuid UUID;
  v_dm3_uuid UUID;
BEGIN
  -- ============== ADMINS (2) ==============
  SELECT public.create_auth_user('admin1@example.com', 'admin123', 'Rahul Sharma', 'admin') INTO v_admin1_uuid;
  SELECT public.create_auth_user('admin2@example.com', 'admin456', 'Priya Verma',  'admin') INTO v_admin2_uuid;

  INSERT INTO public.user_profiles (user_id, role, is_active) VALUES
    (v_admin1_uuid, 'admin', TRUE),
    (v_admin2_uuid, 'admin', TRUE)
  ON CONFLICT (user_id) DO UPDATE SET role='admin', is_active=TRUE, updated_at=NOW();

  INSERT INTO public.admins (name, email, phone, password, is_active, role) VALUES
    ('Rahul Sharma', 'admin1@example.com', '9876543210', crypt('admin123', gen_salt('bf',12)), TRUE, 'admin'),
    ('Priya Verma',  'admin2@example.com', '9123456780', crypt('admin456', gen_salt('bf',12)), TRUE, 'admin')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, password=EXCLUDED.password, is_active=TRUE, role='admin';

  INSERT INTO public.users (name, email, phone, is_active, status) VALUES
    ('Rahul Sharma', 'admin1@example.com', '9876543210', TRUE, 'approved'),
    ('Priya Verma',  'admin2@example.com', '9123456780', TRUE, 'approved')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, is_active=TRUE, status='approved';

  RAISE NOTICE '✅ 2 Admins created: admin1@example.com / admin123, admin2@example.com / admin456';

  -- ============== CUSTOMERS (3) ==============
  SELECT public.create_auth_user('customer1@demo.com', 'Customer@1234', 'John Customer',  'customer') INTO v_cust1_uuid;
  SELECT public.create_auth_user('customer2@demo.com', 'Customer@1234', 'Sarah Buyer',    'customer') INTO v_cust2_uuid;
  SELECT public.create_auth_user('customer3@demo.com', 'Customer@1234', 'Mike Shopper',   'customer') INTO v_cust3_uuid;

  INSERT INTO public.user_profiles (user_id, role, is_active) VALUES
    (v_cust1_uuid, 'customer', TRUE),
    (v_cust2_uuid, 'customer', TRUE),
    (v_cust3_uuid, 'customer', TRUE)
  ON CONFLICT (user_id) DO UPDATE SET role='customer', is_active=TRUE, updated_at=NOW();

  INSERT INTO public.users (name, email, phone, is_active, status, wallet_balance, loyalty_point, ref_code) VALUES
    ('John Customer',  'customer1@demo.com', '555-0001', TRUE, 'approved', 150.00, 250, 'CUST-001'),
    ('Sarah Buyer',    'customer2@demo.com', '555-0002', TRUE, 'approved',  75.50, 120, 'CUST-002'),
    ('Mike Shopper',   'customer3@demo.com', '555-0003', TRUE, 'approved', 200.00, 380, 'CUST-003')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, is_active=TRUE, status='approved';

  RAISE NOTICE '✅ 3 Customers created: customer1@demo.com, customer2@demo.com, customer3@demo.com (all / Customer@1234)';

  -- ============== VENDORS (3) ==============
  SELECT public.create_auth_user('vendor1@demo.com', 'Vendor@1234', 'Burger Junction Owner',    'vendor') INTO v_vendor1_uuid;
  SELECT public.create_auth_user('vendor2@demo.com', 'Vendor@1234', 'Pizza Palace Owner',  'vendor') INTO v_vendor2_uuid;
  SELECT public.create_auth_user('vendor3@demo.com', 'Vendor@1234', 'Sushi World Owner',      'vendor') INTO v_vendor3_uuid;

  INSERT INTO public.user_profiles (user_id, role, is_active) VALUES
    (v_vendor1_uuid, 'vendor', TRUE),
    (v_vendor2_uuid, 'vendor', TRUE),
    (v_vendor3_uuid, 'vendor', TRUE)
  ON CONFLICT (user_id) DO UPDATE SET role='vendor', is_active=TRUE, updated_at=NOW();

  INSERT INTO public.vendors (name, email, phone, status, application_status, is_active) VALUES
    ('Burger Junction Owner',    'vendor1@demo.com', '111-1001', 'approved', 'approved', TRUE),
    ('Pizza Palace Owner',  'vendor2@demo.com', '111-1002', 'approved', 'approved', TRUE),
    ('Sushi World Owner',      'vendor3@demo.com', '111-1003', 'approved', 'approved', TRUE)
  ON CONFLICT (email) DO UPDATE SET status='approved', application_status='approved', is_active=TRUE;

  INSERT INTO public.users (name, email, phone, is_active, status) VALUES
    ('Burger Junction Owner',    'vendor1@demo.com', '111-1001', TRUE, 'approved'),
    ('Pizza Palace Owner',  'vendor2@demo.com', '111-1002', TRUE, 'approved'),
    ('Sushi World Owner',      'vendor3@demo.com', '111-1003', TRUE, 'approved')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, is_active=TRUE, status='approved';

  RAISE NOTICE '✅ 3 Vendors created: vendor1@demo.com, vendor2@demo.com, vendor3@demo.com (all / Vendor@1234)';

  -- ============== DELIVERY MEN (3) ==============
  SELECT public.create_auth_user('dm1@demo.com', 'Delivery@1234', 'John Driver',   'delivery-man') INTO v_dm1_uuid;
  SELECT public.create_auth_user('dm2@demo.com', 'Delivery@1234', 'Sara Rider',    'delivery-man') INTO v_dm2_uuid;
  SELECT public.create_auth_user('dm3@demo.com', 'Delivery@1234', 'Mike Delivery', 'delivery-man') INTO v_dm3_uuid;

  INSERT INTO public.user_profiles (user_id, role, is_active) VALUES
    (v_dm1_uuid, 'delivery-man', TRUE),
    (v_dm2_uuid, 'delivery-man', TRUE),
    (v_dm3_uuid, 'delivery-man', TRUE)
  ON CONFLICT (user_id) DO UPDATE SET role='delivery-man', is_active=TRUE, updated_at=NOW();

  -- Insert into delivery_men table (legacy schema: f_name, l_name, email, phone, zone_id, etc.)
  INSERT INTO public.delivery_men (f_name, l_name, email, phone, status, is_active, zone_id, active) VALUES
    ('John',  'Driver',   'dm1@demo.com', '555-2001', 'approved', TRUE, (SELECT id FROM zones WHERE is_default = TRUE LIMIT 1), TRUE),
    ('Sara',  'Rider',    'dm2@demo.com', '555-2002', 'approved', TRUE, (SELECT id FROM zones WHERE is_default = TRUE LIMIT 1), TRUE),
    ('Mike',  'Delivery', 'dm3@demo.com', '555-2003', 'approved', TRUE, (SELECT id FROM zones WHERE is_default = TRUE LIMIT 1), TRUE)
  ON CONFLICT (email) DO UPDATE SET status='approved', is_active=TRUE, active=TRUE;

  INSERT INTO public.users (name, email, phone, is_active, status) VALUES
    ('John Driver',   'dm1@demo.com', '555-2001', TRUE, 'approved'),
    ('Sara Rider',    'dm2@demo.com', '555-2002', TRUE, 'approved'),
    ('Mike Delivery', 'dm3@demo.com', '555-2003', TRUE, 'approved')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, is_active=TRUE, status='approved';

  RAISE NOTICE '✅ 3 Delivery Men created: dm1@demo.com, dm2@demo.com, dm3@demo.com (all / Delivery@1234)';

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ALL USERS CREATED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Admins:     admin1@example.com / admin123';
  RAISE NOTICE '            admin2@example.com / admin456';
  RAISE NOTICE 'Customers:  customer1@demo.com / Customer@1234';
  RAISE NOTICE '            customer2@demo.com / Customer@1234';
  RAISE NOTICE '            customer3@demo.com / Customer@1234';
  RAISE NOTICE 'Vendors:    vendor1@demo.com / Vendor@1234';
  RAISE NOTICE '            vendor2@demo.com / Vendor@1234';
  RAISE NOTICE '            vendor3@demo.com / Vendor@1234';
  RAISE NOTICE 'Delivery:   dm1@demo.com / Delivery@1234';
  RAISE NOTICE '            dm2@demo.com / Delivery@1234';
  RAISE NOTICE '            dm3@demo.com / Delivery@1234';
  RAISE NOTICE '========================================';
END $$;


-- ---------------------------------------------------------------------
-- PART 3: Insert into auth.identities (if it exists)
-- ---------------------------------------------------------------------

DO $$
BEGIN
  INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  SELECT gen_random_uuid(), u.id,
    jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
    'email', NOW(), NOW(), NOW()
  FROM auth.users u
  WHERE u.email IN (
    'admin1@example.com','admin2@example.com',
    'customer1@demo.com','customer2@demo.com','customer3@demo.com',
    'vendor1@demo.com','vendor2@demo.com','vendor3@demo.com',
    'dm1@demo.com','dm2@demo.com','dm3@demo.com'
  ) AND NOT EXISTS (SELECT 1 FROM auth.identities i WHERE i.user_id = u.id);
  RAISE NOTICE '✅ auth.identities rows inserted';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '⚠️ auth.identities skipped (OK): %', SQLERRM;
END $$;


-- ---------------------------------------------------------------------
-- PART 4: Demo data — modules, zones, stores, items, orders
-- ---------------------------------------------------------------------

-- 4.1 Module (FOOD ONLY — single vertical)
INSERT INTO public.modules (module_name, module_type, slug, status, short_description, description, stores_count, all_zone_service) VALUES
  ('Food', 'food', 'food', TRUE, 'Restaurants and food delivery', 'Order from your favorite restaurants — FoodHub food delivery service', 4, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- 4.2 Zone
INSERT INTO public.zones (name, display_name, status, is_default, cash_on_delivery, digital_payment, coordinates) VALUES
  ('Demo Zone', 'Demo City', TRUE, TRUE, TRUE, TRUE,
   '{"type":"Polygon","coordinates":[[[-74.01,40.71],[-74.01,40.72],[-74.00,40.72],[-74.00,40.71],[-74.01,40.71]]]}'::jsonb)
ON CONFLICT DO NOTHING;

-- 4.3 Module-Zone pricing
INSERT INTO public.module_zone (module_id, zone_id, per_km_shipping_charge, minimum_shipping_charge, maximum_shipping_charge, delivery_charge_type, fixed_shipping_charge)
SELECT m.id, z.id, 1.50, 5.00, 50.00, 'distance', 0
FROM modules m, zones z
WHERE m.slug = 'food' AND z.is_default = TRUE
ON CONFLICT (module_id, zone_id) DO NOTHING;

-- 4.4 Restaurants (4 food restaurants)
INSERT INTO public.stores (name, phone, email, address, lat, lng, minimum_order, comission, status, vendor_id, module_id, zone_id, active, featured, slug, store_business_model, rating, rating_count, order_count)
SELECT s.name, s.phone, s.email, s.address, s.lat, s.lng, s.minimum_order, s.comission, TRUE, v.id, m.id, z.id, TRUE, s.featured, s.slug, 'commission', s.rating, s.rating_count, s.order_count
FROM (VALUES
  ('Burger Junction',  '111-1001', 'burger@demo.com',    '123 Burger St, Demo City',  '40.7128', '-74.0060', 8.00,  5.00, TRUE,  'burger-junction',  4.5, 120, 350),
  ('Pizza Palace',     '111-1002', 'pizza@demo.com',     '456 Pizza Ave, Demo City',  '40.7130', '-74.0050', 12.00, 8.00, TRUE,  'pizza-palace',     4.7,  85, 210),
  ('Sushi World',      '111-1003', 'sushi@demo.com',     '789 Sushi Blvd, Demo City', '40.7135', '-74.0045', 15.00, 6.00, TRUE,  'sushi-world',      4.6,  60, 150),
  ('Taco Fiesta',      '111-1004', 'taco@demo.com',      '321 Taco Rd, Demo City',    '40.7140', '-74.0040', 7.00,  4.00, FALSE, 'taco-fiesta',      4.3,  40,  95)
) AS s(name, phone, email, address, lat, lng, minimum_order, comission, featured, slug, rating, rating_count, order_count),
  vendors v, modules m, zones z
WHERE v.email = CASE s.slug
  WHEN 'burger-junction' THEN 'vendor1@demo.com'
  WHEN 'pizza-palace'    THEN 'vendor2@demo.com'
  WHEN 'sushi-world'     THEN 'vendor3@demo.com'
  WHEN 'taco-fiesta'     THEN 'vendor1@demo.com'
END AND m.module_type = 'food' AND z.is_default = TRUE
ON CONFLICT (slug) DO NOTHING;

-- 4.5 Dish Categories (8 food categories)
INSERT INTO public.categories (name, slug, module_id, status, position, priority, image)
SELECT c.name, c.slug, m.id, TRUE, c.position, c.priority, c.image
FROM (VALUES
  ('Burgers',     'burgers',     1, 'high',   'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200'),
  ('Pizza',       'pizza',       2, 'high',   'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200'),
  ('Sushi',       'sushi',       3, 'high',   'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200'),
  ('Tacos',       'tacos',       4, 'medium', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200'),
  ('Pasta',       'pasta',       5, 'medium', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=200'),
  ('Salads',      'salads',      6, 'low',    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200'),
  ('Desserts',    'desserts',    7, 'medium', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200'),
  ('Beverages',   'beverages',   8, 'medium', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200')
) AS c(name, slug, position, priority, image), modules m
WHERE m.module_type = 'food'
ON CONFLICT (slug) DO NOTHING;

-- 4.6 Dishes (25 food items across 4 restaurants)
INSERT INTO public.items (name, description, image, category_id, store_id, module_id, price, discount, discount_type, stock, slug, status, is_approved, veg, avg_rating, rating_count, order_count, featured, recommended)
SELECT i.name, i.description, i.image, cat.id, st.id, m.id, i.price, i.discount, 'amount', i.stock, i.slug, TRUE, TRUE, i.veg, i.avg_rating, i.rating_count, i.order_count, i.featured, i.recommended
FROM (VALUES
  -- Burgers (Burger Junction)
  ('Classic Cheeseburger',  'Beef patty, cheddar, lettuce, tomato', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 'burgers', 'burger-junction', 'food', 6.99, 0.50, 100, 'classic-cheeseburger',  FALSE, 4.5, 28, 65,  TRUE,  TRUE),
  ('Double Bacon Burger',   'Two patties, bacon, cheese',           'https://images.unsplash.com/photo-1550317138-10000687a72b?w=400',  'burgers', 'burger-junction', 'food', 9.99, 1.00, 80,  'double-bacon-burger',   FALSE, 4.7, 22, 45,  TRUE,  FALSE),
  ('Veggie Burger',         'Plant-based patty, avocado',           'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=400', 'burgers', 'burger-junction', 'food', 5.99, 0.00, 60,  'veggie-burger',         TRUE,  4.4, 18, 35,  FALSE, TRUE),
  ('Chicken Burger',        'Grilled chicken breast',               'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400','burgers', 'burger-junction', 'food', 7.49, 0.50, 90,  'chicken-burger',        FALSE, 4.6, 20, 40,  FALSE, TRUE),
  ('French Fries',          'Crispy golden fries',                  'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400','burgers', 'burger-junction', 'food', 2.99, 0.00, 200, 'french-fries',          TRUE,  4.3, 50, 120, FALSE, TRUE),
  -- Pizza (Pizza Palace)
  ('Margherita Pizza',      'Classic Italian — tomato, mozzarella, basil', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400', 'pizza', 'pizza-palace', 'food', 8.99, 1.00, 50, 'margherita-pizza',  TRUE,  4.8, 45, 120, TRUE,  TRUE),
  ('Pepperoni Pizza',       'Loaded with pepperoni',                'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', 'pizza', 'pizza-palace', 'food', 10.99, 1.50, 45, 'pepperoni-pizza',  FALSE, 4.7, 38, 95,  TRUE,  FALSE),
  ('BBQ Chicken Pizza',     'BBQ sauce, grilled chicken, onions',   'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',  'pizza', 'pizza-palace', 'food', 11.99, 0.00, 40, 'bbq-chicken-pizza', FALSE, 4.6, 25, 60,  FALSE, TRUE),
  ('Veggie Supreme Pizza',  'Peppers, mushrooms, olives, onions',   'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', 'pizza', 'pizza-palace', 'food', 9.99, 0.50, 55, 'veggie-supreme',   TRUE,  4.5, 20, 50,  FALSE, TRUE),
  ('Garlic Bread',          'Cheesy garlic breadsticks',            'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400',  'pizza', 'pizza-palace', 'food', 3.99, 0.00, 100,'garlic-bread',     TRUE,  4.4, 30, 80,  FALSE, TRUE),
  -- Sushi (Sushi World)
  ('California Roll',       '8 pieces — crab, avocado, cucumber',   'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400', 'sushi', 'sushi-world', 'food', 7.99, 0.00, 60, 'california-roll',   FALSE, 4.6, 22, 55,  TRUE,  TRUE),
  ('Salmon Nigiri',         '6 pieces — fresh salmon over rice',    'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400', 'sushi', 'sushi-world', 'food', 9.49, 0.50, 40, 'salmon-nigiri',     FALSE, 4.8, 18, 42,  TRUE,  FALSE),
  ('Tuna Roll',             '8 pieces — fresh tuna, rice, nori',    'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400',  'sushi', 'sushi-world', 'food', 8.49, 0.00, 50, 'tuna-roll',         FALSE, 4.5, 15, 38,  FALSE, TRUE),
  ('Vegetable Tempura',     'Crispy battered vegetables',           'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400', 'sushi', 'sushi-world', 'food', 5.99, 0.00, 70, 'vegetable-tempura', TRUE,  4.3, 12, 30,  FALSE, TRUE),
  ('Miso Soup',             'Traditional soybean paste soup',       'https://images.unsplash.com/photo-1547928576-b822bc410bdf?w=400',    'sushi', 'sushi-world', 'food', 2.49, 0.00, 150,'miso-soup',         TRUE,  4.2, 28, 65,  FALSE, FALSE),
  -- Tacos (Taco Fiesta)
  ('Beef Tacos (3 pcs)',    'Soft tortillas, seasoned beef, salsa', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400', 'tacos', 'taco-fiesta', 'food', 5.99, 0.50, 80, 'beef-tacos',       FALSE, 4.4, 20, 50,  TRUE,  TRUE),
  ('Chicken Tacos (3 pcs)', 'Grilled chicken, lettuce, cheese',     'https://images.unsplash.com/photo-1551504734-5ee1c3831845?w=400',  'tacos', 'taco-fiesta', 'food', 5.49, 0.00, 90, 'chicken-tacos',    FALSE, 4.3, 18, 45,  FALSE, TRUE),
  ('Veggie Tacos (3 pcs)',  'Black beans, avocado, salsa',          'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400','tacos', 'taco-fiesta', 'food', 4.99, 0.00, 70, 'veggie-tacos',     TRUE,  4.2, 12, 28,  FALSE, TRUE),
  ('Nachos Supreme',        'Tortilla chips, cheese, jalapenos',    'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=400','tacos', 'taco-fiesta', 'food', 4.49, 0.00, 100,'nachos-supreme',   TRUE,  4.1, 25, 55,  FALSE, FALSE),
  -- Pasta (Pizza Palace)
  ('Spaghetti Carbonara',   'Pancetta, egg, parmesan',              'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400', 'pasta', 'pizza-palace', 'food', 7.49, 0.00, 60, 'carbonara',        FALSE, 4.5, 15, 35,  FALSE, TRUE),
  ('Penne Arrabbiata',      'Spicy tomato sauce, penne',            'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400',    'pasta', 'pizza-palace', 'food', 6.99, 0.00, 65, 'arrabbiata',       TRUE,  4.4, 12, 28,  FALSE, FALSE),
  -- Salads (Burger Junction)
  ('Caesar Salad',          'Romaine, croutons, parmesan, caesar',  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 'salads', 'burger-junction', 'food', 4.99, 0.00, 80, 'caesar-salad',     FALSE, 4.3, 18, 40,  FALSE, TRUE),
  ('Garden Salad',          'Mixed greens, tomato, cucumber',       'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', 'salads', 'burger-junction', 'food', 3.99, 0.00, 90, 'garden-salad',     TRUE,  4.2, 10, 25,  FALSE, FALSE),
  -- Desserts
  ('Chocolate Lava Cake',   'Molten chocolate cake',                'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',    'desserts', 'pizza-palace', 'food', 4.49, 0.00, 50, 'lava-cake',        TRUE,  4.7, 22, 48,  TRUE,  TRUE),
  ('Tiramisu',              'Italian coffee-flavored dessert',      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', 'desserts', 'sushi-world', 'food', 4.99, 0.50, 45, 'tiramisu',         TRUE,  4.6, 15, 32,  FALSE, TRUE),
  -- Beverages
  ('Coca-Cola 330ml',       'Chilled soda',                         'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',    'beverages', 'burger-junction', 'food', 1.20, 0.00, 200,'coca-cola-330', TRUE, 4.0, 60, 180, FALSE, TRUE),
  ('Fresh Orange Juice',    '100% pure juice, 400ml',               'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', 'beverages', 'burger-junction', 'food', 2.50, 0.20, 80, 'orange-juice',   TRUE, 4.6, 22, 55,  TRUE,  TRUE),
  ('Iced Coffee',           'Cold brew with milk',                  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', 'beverages', 'pizza-palace', 'food', 2.99, 0.00, 100,'iced-coffee',    TRUE, 4.5, 30, 70,  FALSE, TRUE)
) AS i(name, description, image, cat_slug, store_slug, module_type, price, discount, stock, slug, veg, avg_rating, rating_count, order_count, featured, recommended),
  categories cat, stores st, modules m
WHERE cat.slug = i.cat_slug AND st.slug = i.store_slug AND m.module_type = i.module_type
ON CONFLICT (slug) DO NOTHING;

-- 4.7 Orders (10 — various statuses)
INSERT INTO public.orders (order_amount, order_status, payment_status, payment_method, created_at) VALUES
  (12.97, 'delivered',  'paid',     'cash_on_delivery', '2026-09-01T10:00:00Z'),
  ( 8.48, 'delivered',  'paid',     'cash_on_delivery', '2026-09-02T11:00:00Z'),
  (22.97, 'pending',    'unpaid',   'cash_on_delivery', '2026-09-03T12:00:00Z'),
  ( 6.98, 'confirmed',  'paid',     'cash_on_delivery', '2026-09-04T13:00:00Z'),
  (15.46, 'processing', 'paid',     'cash_on_delivery', '2026-09-05T14:00:00Z'),
  ( 9.99, 'delivered',  'paid',     'cash_on_delivery', '2026-09-06T15:00:00Z'),
  (18.45, 'canceled',   'refunded', 'cash_on_delivery', '2026-09-06T16:00:00Z'),
  ( 4.49, 'delivered',  'paid',     'cash_on_delivery', '2026-09-07T09:00:00Z'),
  (11.20, 'delivered',  'paid',     'cash_on_delivery', '2026-09-07T10:00:00Z'),
  (27.50, 'processing', 'paid',     'cash_on_delivery', '2026-09-07T11:00:00Z')
ON CONFLICT DO NOTHING;

-- 4.8 Banners (3 food-themed)
INSERT INTO public.banners (title, image, status) VALUES
  ('Free Delivery on First Order', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900', TRUE),
  ('20% Off All Pizzas This Week', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900', TRUE),
  ('New Restaurants Now Open',     'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=900', TRUE)
ON CONFLICT DO NOTHING;

-- 4.9 Coupons (3 food-themed)
INSERT INTO public.coupons (code, title, discount, status) VALUES
  ('WELCOME10', '10% off your first food order',  10, TRUE),
  ('PIZZA20',   '20% off all pizzas',              20, TRUE),
  ('FREEDEL',   'Free delivery on orders $25+',     0, TRUE)
ON CONFLICT DO NOTHING;

-- 4.10 Customer addresses (3 — one per customer)
INSERT INTO public.customer_addresses (user_id, address_type, address, lat, lng, contact_person_name, contact_person_number, label, is_default)
SELECT up.user_id, 'home', a.address, a.lat, a.lng, a.name, a.phone, a.label, TRUE
FROM (VALUES
  ('customer1@demo.com', '123 Home St, Demo City',  '40.7128', '-74.0060', 'John Customer',  '555-0001', 'Home'),
  ('customer2@demo.com', '456 Work Ave, Demo City',  '40.7130', '-74.0050', 'Sarah Buyer',    '555-0002', 'Work'),
  ('customer3@demo.com', '789 Park Rd, Demo City',   '40.7135', '-74.0045', 'Mike Shopper',   '555-0003', 'Home')
) AS a(email, address, lat, lng, name, phone, label),
  public.user_profiles up, auth.users au
WHERE au.email = a.email AND up.user_id = au.id
ON CONFLICT DO NOTHING;


-- ---------------------------------------------------------------------
-- PART 5: Verification queries
-- ---------------------------------------------------------------------

SELECT '========================================' AS status;
SELECT '✅ DATABASE SETUP COMPLETE' AS status;
SELECT '========================================' AS status;
SELECT '' AS status;
SELECT '--- USERS ---' AS status;
SELECT 'auth.users' AS table_name, COUNT(*) AS cnt FROM auth.users
UNION ALL SELECT 'user_profiles',  COUNT(*) FROM public.user_profiles
UNION ALL SELECT 'admins',         COUNT(*) FROM public.admins
UNION ALL SELECT 'users',          COUNT(*) FROM public.users
UNION ALL SELECT 'vendors',        COUNT(*) FROM public.vendors
UNION ALL SELECT 'delivery_men',   COUNT(*) FROM public.delivery_men;
SELECT '' AS status;
SELECT '--- DEMO DATA ---' AS status;
SELECT 'modules' AS table_name, COUNT(*) AS cnt FROM public.modules
UNION ALL SELECT 'zones',         COUNT(*) FROM public.zones
UNION ALL SELECT 'stores',        COUNT(*) FROM public.stores
UNION ALL SELECT 'categories',    COUNT(*) FROM public.categories
UNION ALL SELECT 'items',         COUNT(*) FROM public.items
UNION ALL SELECT 'orders',        COUNT(*) FROM public.orders
UNION ALL SELECT 'banners',       COUNT(*) FROM public.banners
UNION ALL SELECT 'coupons',       COUNT(*) FROM public.coupons
UNION ALL SELECT 'customer_addresses', COUNT(*) FROM public.customer_addresses;

SELECT '' AS status;
SELECT '--- LOGIN CREDENTIALS ---' AS status;
SELECT 'Admins:     admin1@example.com / admin123' AS credentials
UNION ALL SELECT '            admin2@example.com / admin456'
UNION ALL SELECT 'Customers:  customer1@demo.com / Customer@1234'
UNION ALL SELECT '            customer2@demo.com / Customer@1234'
UNION ALL SELECT '            customer3@demo.com / Customer@1234'
UNION ALL SELECT 'Vendors:    vendor1@demo.com / Vendor@1234'
UNION ALL SELECT '            vendor2@demo.com / Vendor@1234'
UNION ALL SELECT '            vendor3@demo.com / Vendor@1234'
UNION ALL SELECT 'Delivery:   dm1@demo.com / Delivery@1234'
UNION ALL SELECT '            dm2@demo.com / Delivery@1234'
UNION ALL SELECT '            dm3@demo.com / Delivery@1234';

-- ===== END seed_demo.sql =====
