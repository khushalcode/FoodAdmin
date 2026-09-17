-- ============================================================================
-- FoodHub Customer App V5.1 — Supabase Migration
-- Grocery-Ported Food Features (UI Enhancements)
-- ----------------------------------------------------------------------------
-- This migration adds the columns / tables required by the new grocery-ported
-- features that have been layered onto the food module:
--
--   1. items.*                       — allergens, ingredients, nutrition,
--                                       bulk-discount tiers, dietary tags,
--                                       subscription / restock eligibility
--   2. stores.*                      — bulk-order discount, free-delivery
--                                       threshold, cashback, loyalty earn
--                                       rate, kitchen badges
--   3. item_nutrition                — per-dish nutrition facts table
--   4. item_bulk_discount_tiers      — qty-based discount ladder per item
--   5. restock_alerts                — user opt-in restock notifications
--   6. item_subscriptions            — weekly recurring meal subscriptions
--   7. food_brands                   — F&B brand catalog
--   8. food_brand_stores             — many-to-many brand ↔ store mapping
--   9. blog_posts                    — food journal articles
--  10. food_flash_sales              — time-boxed deals
--  11. food_flash_sale_items         — items participating in a flash sale
--  12. loyalty_tiers                 — silver/gold/platinum membership tiers
--  13. user_loyalty_tiers            — per-user tier assignment
--  14. delivery_slots                — schedulable delivery time windows
--  15. cashback_offers               — promotional cashback campaigns
--  16. user_cashback_transactions    — per-user cashback ledger
--  17. surge_charges                 — demand/weather-based surcharge config
--  18. delivery_instructions         — saved per-user delivery instructions
--  19. user_subscriptions            — FoodHub Plus membership ledger
--
-- Run order:
--   1. Apply base_schema.sql + init.sql from the admin panel
--   2. Apply this file (foodhub_customer_v5_1_food_features.sql) on top
--   3. Optional: apply seed_food_features_demo.sql to load demo data
--
-- All tables use UUID primary keys where the row is user-scoped, BIGINT
-- where it references platform-wide catalog data. RLS is enabled on every
-- user-owned table; platform tables are SELECT-only for authenticated users.
-- ============================================================================

-- ============================================================================
-- 1. ALTER items — add dietary, allergen, subscription, restock columns
-- ============================================================================
ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS is_gluten_free        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_spicy              BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_chef_special       BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_best_seller        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_new                BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergens             TEXT[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ingredients           TEXT[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS subscription_eligible BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS restock_enabled       BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN public.items.is_gluten_free        IS 'V5.1 — dietary tag: gluten-free dish';
COMMENT ON COLUMN public.items.is_spicy              IS 'V5.1 — dietary tag: spicy dish';
COMMENT ON COLUMN public.items.is_chef_special       IS 'V5.1 — badge: chef-curated dish';
COMMENT ON COLUMN public.items.is_best_seller        IS 'V5.1 — badge: top-ordered dish';
COMMENT ON COLUMN public.items.is_new                IS 'V5.1 — badge: recently added to menu';
COMMENT ON COLUMN public.items.allergens             IS 'V5.1 — array of allergen keys (gluten, dairy, peanuts, tree_nuts, soy, eggs, fish, shellfish, sesame, mustard, celery, sulphites, lupin)';
COMMENT ON COLUMN public.items.ingredients           IS 'V5.1 — full ingredient list for display on product detail';
COMMENT ON COLUMN public.items.subscription_eligible IS 'V5.1 — can be set up as a weekly recurring subscription';
COMMENT ON COLUMN public.items.restock_enabled       IS 'V5.1 — users can opt-in to be notified when this dish is back in stock';

-- ============================================================================
-- 2. ALTER stores — add bulk-order discount, free-delivery threshold,
--    cashback, loyalty earn rate, kitchen badges, subscription support
-- ============================================================================
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS bulk_order_discount_amount   NUMERIC(10,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bulk_order_discount_percent  NUMERIC(5,2)   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS free_delivery_over_amount    NUMERIC(10,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cashback_offer_id            BIGINT       DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS loyalty_earn_rate            NUMERIC(5,2)   DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS subscription_enabled         BOOLEAN      DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_express                   BOOLEAN      DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_top_rated                 BOOLEAN      DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_open_now_24h              BOOLEAN      DEFAULT FALSE;

COMMENT ON COLUMN public.stores.bulk_order_discount_amount  IS 'V5.1 — minimum cart subtotal to unlock bulk discount';
COMMENT ON COLUMN public.stores.bulk_order_discount_percent IS 'V5.1 — discount percent applied when bulk threshold met';
COMMENT ON COLUMN public.stores.free_delivery_over_amount  IS 'V5.1 — minimum cart subtotal to qualify for free delivery';
COMMENT ON COLUMN public.stores.cashback_offer_id          IS 'V5.1 — FK to cashback_offers.id when kitchen has an active cashback campaign';
COMMENT ON COLUMN public.stores.loyalty_earn_rate          IS 'V5.1 — flavour points earned per $1 spent at this kitchen (default 1.0)';
COMMENT ON COLUMN public.stores.subscription_enabled       IS 'V5.1 — kitchen offers weekly subscription meals';
COMMENT ON COLUMN public.stores.is_express                 IS 'V5.1 — kitchen offers <30 min express delivery';
COMMENT ON COLUMN public.stores.is_top_rated               IS 'V5.1 — kitchen rated 4.5★ or above (auto-computed)';
COMMENT ON COLUMN public.stores.is_open_now_24h            IS 'V5.1 — kitchen operates 24/7';

-- ============================================================================
-- 3. item_nutrition — per-dish nutrition facts (1:1 with items)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.item_nutrition (
  item_id                 BIGINT      PRIMARY KEY REFERENCES public.items(id) ON DELETE CASCADE,
  calories                INTEGER     NOT NULL,
  protein_g               NUMERIC(6,2),
  carbs_g                 NUMERIC(6,2),
  fat_g                   NUMERIC(6,2),
  fiber_g                 NUMERIC(6,2),
  sugar_g                 NUMERIC(6,2),
  sodium_mg               NUMERIC(7,2),
  serving_size            TEXT,
  servings_per_container  INTEGER,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.item_nutrition ENABLE ROW LEVEL SECURITY;
CREATE POLICY item_nutrition_read ON public.item_nutrition
  FOR SELECT TO authenticated USING (true);

COMMENT ON TABLE public.item_nutrition IS 'V5.1 — Per-serving nutrition facts for each dish on the menu';

-- ============================================================================
-- 4. item_bulk_discount_tiers — qty-based discount ladder (1:N with items)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.item_bulk_discount_tiers (
  id          BIGSERIAL    PRIMARY KEY,
  item_id     BIGINT       NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  store_id    BIGINT       NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  min_qty     INTEGER      NOT NULL CHECK (min_qty >= 1),
  percent     NUMERIC(5,2) NOT NULL CHECK (percent > 0 AND percent <= 100),
  label       TEXT,
  is_active   BOOLEAN      DEFAULT TRUE,
  created_at  TIMESTAMPTZ  DEFAULT now(),
  UNIQUE (item_id, min_qty)
);

CREATE INDEX IF NOT EXISTS idx_item_bulk_tiers_item  ON public.item_bulk_discount_tiers(item_id);
CREATE INDEX IF NOT EXISTS idx_item_bulk_tiers_store ON public.item_bulk_discount_tiers(store_id);

ALTER TABLE public.item_bulk_discount_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY bulk_tiers_read ON public.item_bulk_discount_tiers
  FOR SELECT TO authenticated USING (is_active = TRUE);

COMMENT ON TABLE public.item_bulk_discount_tiers IS 'V5.1 — Bulk discount ladder: order 3+ portions → 5% off, 5+ → 10% off, etc.';

-- ============================================================================
-- 5. restock_alerts — user opts-in to be notified when a dish returns
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.restock_alerts (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id       BIGINT       NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  store_id      BIGINT       NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  status        TEXT         NOT NULL DEFAULT 'waiting'
                              CHECK (status IN ('waiting', 'notified', 'expired', 'cancelled')),
  created_at    TIMESTAMPTZ  DEFAULT now(),
  notified_at   TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ  DEFAULT (now() + INTERVAL '10 days')
);

CREATE INDEX IF NOT EXISTS idx_restock_user   ON public.restock_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_restock_item   ON public.restock_alerts(item_id);
CREATE INDEX IF NOT EXISTS idx_restock_status ON public.restock_alerts(status);

ALTER TABLE public.restock_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY restock_owner_all ON public.restock_alerts
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

COMMENT ON TABLE public.restock_alerts IS 'V5.1 — User opt-in: notify me when an out-of-stock dish returns to the menu';

-- ============================================================================
-- 6. item_subscriptions — weekly recurring meal subscriptions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.item_subscriptions (
  id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id                  BIGINT       NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  store_id                 BIGINT       NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  quantity                 INTEGER      NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  frequency_days           INTEGER      NOT NULL DEFAULT 7
                                          CHECK (frequency_days IN (7, 14, 30)),
  next_delivery_at         TIMESTAMPTZ  NOT NULL,
  total_deliveries         INTEGER      NOT NULL DEFAULT 0,
  completed_deliveries     INTEGER      NOT NULL DEFAULT 0,
  status                   TEXT         NOT NULL DEFAULT 'active'
                                          CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  discount_percent         NUMERIC(5,2) NOT NULL DEFAULT 15.0,
  created_at               TIMESTAMPTZ  DEFAULT now(),
  updated_at               TIMESTAMPTZ  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_item_subs_user   ON public.item_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_item_subs_status ON public.item_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_item_subs_next   ON public.item_subscriptions(next_delivery_at);

ALTER TABLE public.item_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY item_subs_owner_all ON public.item_subscriptions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

COMMENT ON TABLE public.item_subscriptions IS 'V5.1 — Weekly/biweekly/monthly recurring meal delivery with 15% subscriber discount';

-- ============================================================================
-- 7. food_brands — F&B brand catalog (restaurant chains)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.food_brands (
  id              BIGSERIAL    PRIMARY KEY,
  name            TEXT         NOT NULL,
  slug            TEXT         NOT NULL UNIQUE,
  logo_url        TEXT         NOT NULL,
  cover_image_url TEXT,
  description     TEXT,
  is_featured     BOOLEAN      DEFAULT FALSE,
  is_verified     BOOLEAN      DEFAULT FALSE,
  cuisine_types   TEXT[]       DEFAULT NULL,
  status          BOOLEAN      DEFAULT TRUE,
  created_at      TIMESTAMPTZ  DEFAULT now(),
  updated_at      TIMESTAMPTZ  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_brands_slug      ON public.food_brands(slug);
CREATE INDEX IF NOT EXISTS idx_food_brands_featured  ON public.food_brands(is_featured);

ALTER TABLE public.food_brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY food_brands_read ON public.food_brands
  FOR SELECT TO authenticated USING (status = TRUE);

COMMENT ON TABLE public.food_brands IS 'V5.1 — F&B brand catalog (Burger King, Domino''s, KFC, Starbucks, etc.)';

-- ============================================================================
-- 8. food_brand_stores — many-to-many brand ↔ store mapping
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.food_brand_stores (
  brand_id  BIGINT      NOT NULL REFERENCES public.food_brands(id) ON DELETE CASCADE,
  store_id  BIGINT      NOT NULL REFERENCES public.stores(id)     ON DELETE CASCADE,
  PRIMARY KEY (brand_id, store_id)
);

CREATE INDEX IF NOT EXISTS idx_brand_stores_store ON public.food_brand_stores(store_id);

ALTER TABLE public.food_brand_stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY brand_stores_read ON public.food_brand_stores
  FOR SELECT TO authenticated USING (true);

-- View: brands with aggregated item/store counts
CREATE OR REPLACE VIEW public.v_food_brands_with_counts AS
SELECT
  b.id, b.name, b.slug, b.logo_url, b.cover_image_url, b.description,
  b.is_featured, b.is_verified, b.cuisine_types, b.status,
  COUNT(DISTINCT bs.store_id) AS store_count,
  COUNT(DISTINCT i.id)         AS item_count
FROM public.food_brands b
LEFT JOIN public.food_brand_stores bs ON bs.brand_id = b.id
LEFT JOIN public.items i              ON i.store_id IN (
  SELECT store_id FROM public.food_brand_stores WHERE brand_id = b.id
)
GROUP BY b.id;

COMMENT ON VIEW public.v_food_brands_with_counts IS 'V5.1 — Convenience view exposing brand → store_count + item_count';

-- ============================================================================
-- 9. blog_posts — food journal articles
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id              BIGSERIAL    PRIMARY KEY,
  title           TEXT         NOT NULL,
  slug            TEXT         NOT NULL UNIQUE,
  excerpt         TEXT         NOT NULL,
  body            TEXT,
  cover_image_url TEXT         NOT NULL,
  author_name     TEXT         NOT NULL,
  author_avatar_url TEXT,
  category        TEXT         NOT NULL DEFAULT 'food_guides'
                    CHECK (category IN ('recipes', 'chef_stories', 'food_guides', 'trends', 'news')),
  reading_time_min INTEGER    NOT NULL DEFAULT 5,
  published_at    TIMESTAMPTZ  DEFAULT now(),
  tags            TEXT[]       DEFAULT NULL,
  views_count     INTEGER      DEFAULT 0,
  likes_count     INTEGER      DEFAULT 0,
  status          TEXT         NOT NULL DEFAULT 'published'
                    CHECK (status IN ('draft', 'published', 'archived')),
  created_at      TIMESTAMPTZ  DEFAULT now(),
  updated_at      TIMESTAMPTZ  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_slug       ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_category   ON public.blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_published  ON public.blog_posts(published_at DESC);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY blog_read ON public.blog_posts
  FOR SELECT TO authenticated USING (status = 'published');

COMMENT ON TABLE public.blog_posts IS 'V5.1 — Food journal: recipes, chef stories, food guides, trends & news';

-- ============================================================================
-- 10. food_flash_sales — time-boxed deals
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.food_flash_sales (
  id                BIGSERIAL    PRIMARY KEY,
  title             TEXT         NOT NULL,
  subtitle          TEXT,
  image_url         TEXT,
  start_date        TIMESTAMPTZ  NOT NULL,
  end_date          TIMESTAMPTZ  NOT NULL,
  discount_percent  NUMERIC(5,2) NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  total_stock       INTEGER      NOT NULL DEFAULT 0,
  sold_count        INTEGER      NOT NULL DEFAULT 0,
  is_active         BOOLEAN      DEFAULT TRUE,
  created_at        TIMESTAMPTZ  DEFAULT now(),
  updated_at        TIMESTAMPTZ  DEFAULT now(),
  CHECK (end_date > start_date)
);

CREATE INDEX IF NOT EXISTS idx_flash_active   ON public.food_flash_sales(start_date, end_date) WHERE is_active = TRUE;

ALTER TABLE public.food_flash_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY flash_sale_read ON public.food_flash_sales
  FOR SELECT TO authenticated USING (is_active = TRUE);

COMMENT ON TABLE public.food_flash_sales IS 'V5.1 — Time-boxed flash deals (e.g., "Lunch Hour Madness 12–2 PM", "Late Night Cravings BOGO")';

-- ============================================================================
-- 11. food_flash_sale_items — items participating in a flash sale
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.food_flash_sale_items (
  flash_sale_id  BIGINT  NOT NULL REFERENCES public.food_flash_sales(id) ON DELETE CASCADE,
  item_id        BIGINT  NOT NULL REFERENCES public.items(id)            ON DELETE CASCADE,
  stock_limit    INTEGER NOT NULL DEFAULT 0,
  sold_count     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (flash_sale_id, item_id)
);

ALTER TABLE public.food_flash_sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY flash_sale_items_read ON public.food_flash_sale_items
  FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- 12. loyalty_tiers — silver/gold/platinum membership tiers
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.loyalty_tiers (
  id                BIGSERIAL    PRIMARY KEY,
  name              TEXT         NOT NULL UNIQUE,
  min_points        INTEGER      NOT NULL DEFAULT 0,
  cashback_percent  NUMERIC(5,2) NOT NULL DEFAULT 0,
  perks             TEXT[]       NOT NULL DEFAULT '{}',
  icon              TEXT         NOT NULL,
  color             TEXT         NOT NULL,
  is_active         BOOLEAN      DEFAULT TRUE,
  created_at        TIMESTAMPTZ  DEFAULT now()
);

INSERT INTO public.loyalty_tiers (name, min_points, cashback_percent, perks, icon, color) VALUES
  ('Silver Fork',   0,    2,  ARRAY['2% cashback on every order', 'Birthday surprise dish'], 'silverware-fork-knife', '#9CA3AF'),
  ('Gold Plate',    1000, 5,  ARRAY['5% cashback on every order', 'Priority chef queue', 'Free delivery over $15', 'Exclusive Gold-only coupons'], 'gold', '#FBBF24'),
  ('Platinum Chef', 5000, 10, ARRAY['10% cashback on every order', 'VIP express delivery', 'Free delivery — no minimum', 'Early access to flash sales', 'Personal chef concierge'], 'crown', '#A78BFA')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY loyalty_tiers_read ON public.loyalty_tiers
  FOR SELECT TO authenticated USING (is_active = TRUE);

COMMENT ON TABLE public.loyalty_tiers IS 'V5.1 — Loyalty tier definitions (Silver Fork / Gold Plate / Platinum Chef)';

-- ============================================================================
-- 13. user_loyalty_tiers — per-user tier assignment + lifetime points
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_loyalty_tiers (
  user_id          UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id          BIGINT       NOT NULL REFERENCES public.loyalty_tiers(id),
  lifetime_points  INTEGER      NOT NULL DEFAULT 0,
  current_points   INTEGER      NOT NULL DEFAULT 0,
  assigned_at      TIMESTAMPTZ  DEFAULT now(),
  updated_at       TIMESTAMPTZ  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_loyalty_tier ON public.user_loyalty_tiers(tier_id);

ALTER TABLE public.user_loyalty_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_loyalty_owner_select ON public.user_loyalty_tiers
  FOR SELECT TO authenticated USING (user_id = auth.uid());

COMMENT ON TABLE public.user_loyalty_tiers IS 'V5.1 — Per-user loyalty tier assignment + lifetime/current points balance';

-- ============================================================================
-- 14. delivery_slots — schedulable delivery time windows per store
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.delivery_slots (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id      BIGINT       REFERENCES public.stores(id) ON DELETE CASCADE,
  label         TEXT         NOT NULL,
  slot_date     DATE         NOT NULL,
  start_time    TIME         NOT NULL,
  end_time      TIME         NOT NULL,
  is_available  BOOLEAN      DEFAULT TRUE,
  is_express    BOOLEAN      DEFAULT FALSE,
  extra_charge  NUMERIC(10,2) DEFAULT 0,
  max_orders    INTEGER      DEFAULT 50,
  booked_orders INTEGER      DEFAULT 0,
  created_at    TIMESTAMPTZ  DEFAULT now(),
  CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_delivery_slots_store_date ON public.delivery_slots(store_id, slot_date);

ALTER TABLE public.delivery_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY delivery_slots_read ON public.delivery_slots
  FOR SELECT TO authenticated USING (is_available = TRUE);

COMMENT ON TABLE public.delivery_slots IS 'V5.1 — Schedulable delivery windows (ASAP, Today 12–1 PM, Tomorrow 7–8 PM, etc.)';

-- ============================================================================
-- 15. cashback_offers — promotional cashback campaigns
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cashback_offers (
  id                BIGSERIAL    PRIMARY KEY,
  title             TEXT         NOT NULL,
  description       TEXT         NOT NULL,
  percent           NUMERIC(5,2) NOT NULL CHECK (percent > 0 AND percent <= 100),
  min_order_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_cashback      NUMERIC(10,2) NOT NULL DEFAULT 0,
  status            TEXT         NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'expired', 'upcoming')),
  starts_at         TIMESTAMPTZ  DEFAULT now(),
  expires_at        TIMESTAMPTZ  NOT NULL,
  created_at        TIMESTAMPTZ  DEFAULT now(),
  updated_at        TIMESTAMPTZ  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cashback_active ON public.cashback_offers(starts_at, expires_at) WHERE status = 'active';

ALTER TABLE public.cashback_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY cashback_read ON public.cashback_offers
  FOR SELECT TO authenticated USING (status = 'active');

COMMENT ON TABLE public.cashback_offers IS 'V5.1 — Cashback campaigns (Weekend Feast 10%, First Order 15%, Late Night 5%)';

-- ============================================================================
-- 16. user_cashback_transactions — per-user cashback ledger
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_cashback_transactions (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id        BIGINT       REFERENCES public.orders(id) ON DELETE SET NULL,
  offer_id        BIGINT       REFERENCES public.cashback_offers(id) ON DELETE SET NULL,
  type            TEXT         NOT NULL CHECK (type IN ('credit', 'debit')),
  amount          NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  reference       TEXT         NOT NULL,
  description     TEXT,
  status          TEXT         NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at      TIMESTAMPTZ  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cashback_txn_user ON public.user_cashback_transactions(user_id);

ALTER TABLE public.user_cashback_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY cashback_txn_owner_select ON public.user_cashback_transactions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

COMMENT ON TABLE public.user_cashback_transactions IS 'V5.1 — Per-user cashback ledger (pending → confirmed after order delivery)';

-- ============================================================================
-- 17. surge_charges — demand/weather-based surcharge config (zone-scoped)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.surge_charges (
  id          BIGSERIAL    PRIMARY KEY,
  zone_id     BIGINT       REFERENCES public.zones(id) ON DELETE CASCADE,
  reason      TEXT         NOT NULL,
  amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  percent     NUMERIC(5,2) DEFAULT 0,
  is_active   BOOLEAN      DEFAULT FALSE,
  starts_at   TIMESTAMPTZ  DEFAULT now(),
  ends_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_surge_zone_active ON public.surge_charges(zone_id, is_active);

ALTER TABLE public.surge_charges ENABLE ROW LEVEL SECURITY;
CREATE POLICY surge_read ON public.surge_charges
  FOR SELECT TO authenticated USING (is_active = TRUE);

COMMENT ON TABLE public.surge_charges IS 'V5.1 — Zone-scoped surge pricing (high demand, bad weather, festival rush)';

-- ============================================================================
-- 18. delivery_instructions — saved per-user delivery instructions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.delivery_instructions (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label       TEXT         NOT NULL,
  icon        TEXT,
  is_default  BOOLEAN      DEFAULT FALSE,
  created_at  TIMESTAMPTZ  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_delivery_instr_user ON public.delivery_instructions(user_id);

ALTER TABLE public.delivery_instructions ENABLE ROW LEVEL SECURITY;
CREATE POLICY delivery_instr_owner_all ON public.delivery_instructions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

COMMENT ON TABLE public.delivery_instructions IS 'V5.1 — Saved per-user delivery instructions (Leave at door / Avoid calling / Call ASAP / etc.)';

-- ============================================================================
-- 19. user_subscriptions — FoodHub Plus membership ledger
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_name    TEXT         NOT NULL DEFAULT 'FoodHub Plus',
  price           NUMERIC(10,2) NOT NULL,
  duration_days   INTEGER      NOT NULL,
  status          TEXT         NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at      TIMESTAMPTZ  DEFAULT now(),
  expired_at      TIMESTAMPTZ  NOT NULL,
  auto_renew      BOOLEAN      DEFAULT TRUE,
  payment_method  TEXT,
  created_at      TIMESTAMPTZ  DEFAULT now(),
  updated_at      TIMESTAMPTZ  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_subs_user   ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subs_status ON public.user_subscriptions(status);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_subs_owner_select ON public.user_subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

COMMENT ON TABLE public.user_subscriptions IS 'V5.1 — FoodHub Plus membership ledger ($4.99/mo or $39.99/yr)';

-- ============================================================================
-- 20. Trigger: auto-assign Silver Fork tier on user signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_assign_default_loyalty_tier()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_loyalty_tiers (user_id, tier_id, lifetime_points, current_points)
  SELECT NEW.id, t.id, 0, 0
  FROM public.loyalty_tiers t
  WHERE t.name = 'Silver Fork'
  LIMIT 1
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_assign_default_loyalty_tier ON auth.users;
CREATE TRIGGER trg_assign_default_loyalty_tier
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.fn_assign_default_loyalty_tier();

COMMENT ON FUNCTION public.fn_assign_default_loyalty_tier IS 'V5.1 — Auto-assign Silver Fork loyalty tier when a new user signs up';

-- ============================================================================
-- 21. Trigger: promote tier when lifetime_points crosses threshold
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_promote_loyalty_tier()
RETURNS TRIGGER AS $$
DECLARE
  new_tier_id BIGINT;
BEGIN
  SELECT id INTO new_tier_id
  FROM public.loyalty_tiers
  WHERE min_points <= NEW.lifetime_points
    AND is_active = TRUE
  ORDER BY min_points DESC
  LIMIT 1;

  IF new_tier_id IS NOT NULL AND new_tier_id <> NEW.tier_id THEN
    NEW.tier_id := new_tier_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_promote_loyalty_tier ON public.user_loyalty_tiers;
CREATE TRIGGER trg_promote_loyalty_tier
  BEFORE UPDATE OF lifetime_points ON public.user_loyalty_tiers
  FOR EACH ROW EXECUTE FUNCTION public.fn_promote_loyalty_tier();

COMMENT ON FUNCTION public.fn_promote_loyalty_tier IS 'V5.1 — Auto-promote user tier when lifetime_points crosses threshold (Silver → Gold → Platinum)';

-- ============================================================================
-- 22. Trigger: auto-mark is_top_rated when store rating crosses 4.5
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_update_store_top_rated()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rating >= 4.5 AND NEW.rating_count >= 50 THEN
    NEW.is_top_rated := TRUE;
  ELSE
    NEW.is_top_rated := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_store_top_rated ON public.stores;
CREATE TRIGGER trg_update_store_top_rated
  BEFORE INSERT OR UPDATE OF rating, rating_count ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.fn_update_store_top_rated();

COMMENT ON FUNCTION public.fn_update_store_top_rated IS 'V5.1 — Auto-flag store as is_top_rated when rating >= 4.5 AND rating_count >= 50';

-- ============================================================================
-- 23. View: items with full nutrition + bulk tiers (read-only convenience)
-- ============================================================================
CREATE OR REPLACE VIEW public.v_items_with_food_features AS
SELECT
  i.*,
  n.calories, n.protein_g, n.carbs_g, n.fat_g, n.fiber_g, n.sugar_g, n.sodium_mg,
  n.serving_size AS nutrition_serving_size,
  (SELECT jsonb_agg(jsonb_build_object('min_qty', t.min_qty, 'percent', t.percent, 'label', t.label))
     FROM public.item_bulk_discount_tiers t
    WHERE t.item_id = i.id AND t.is_active = TRUE) AS bulk_tiers
FROM public.items i
LEFT JOIN public.item_nutrition n ON n.item_id = i.id;

COMMENT ON VIEW public.v_items_with_food_features IS 'V5.1 — Convenience view exposing items + nutrition + bulk discount tiers in a single SELECT';

-- ============================================================================
-- 24. View: stores with kitchen badges + cashback + bulk discount
-- ============================================================================
CREATE OR REPLACE VIEW public.v_stores_with_food_features AS
SELECT
  s.*,
  co.title AS cashback_offer_title,
  co.percent AS cashback_offer_percent,
  co.min_order_amount AS cashback_offer_min_order,
  co.max_cashback AS cashback_offer_max_cashback,
  co.expires_at AS cashback_offer_expires_at
FROM public.stores s
LEFT JOIN public.cashback_offers co ON co.id = s.cashback_offer_id AND co.status = 'active';

COMMENT ON VIEW public.v_stores_with_food_features IS 'V5.1 — Convenience view exposing stores + active cashback offers';

-- ============================================================================
-- 25. View: user dashboard (loyalty + cashback + subscriptions summary)
-- ============================================================================
CREATE OR REPLACE VIEW public.v_user_dashboard AS
SELECT
  u.id AS user_id,
  COALESCE(ult.current_points, 0)  AS current_points,
  COALESCE(ult.lifetime_points, 0) AS lifetime_points,
  lt.name AS tier_name,
  lt.cashback_percent AS tier_cashback_percent,
  lt.icon AS tier_icon,
  lt.color AS tier_color,
  COALESCE(cb.pending_cashback, 0)  AS pending_cashback,
  COALESCE(cb.confirmed_cashback, 0) AS confirmed_cashback,
  us.status AS subscription_status,
  us.expired_at AS subscription_expires_at
FROM auth.users u
LEFT JOIN public.user_loyalty_tiers ult ON ult.user_id = u.id
LEFT JOIN public.loyalty_tiers lt       ON lt.id = ult.tier_id
LEFT JOIN (
  SELECT user_id,
    SUM(CASE WHEN status = 'pending'   THEN amount ELSE 0 END) AS pending_cashback,
    SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END) AS confirmed_cashback
  FROM public.user_cashback_transactions
  WHERE type = 'credit'
  GROUP BY user_id
) cb ON cb.user_id = u.id
LEFT JOIN LATERAL (
  SELECT * FROM public.user_subscriptions
  WHERE user_id = u.id AND status = 'active'
  ORDER BY expired_at DESC LIMIT 1
) us ON TRUE;

COMMENT ON VIEW public.v_user_dashboard IS 'V5.1 — Customer dashboard summary: loyalty tier + cashback ledger + subscription status';

-- ============================================================================
-- 26. Updated updated_at triggers (idempotent)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'item_nutrition', 'item_bulk_discount_tiers', 'item_subscriptions',
    'food_brands', 'blog_posts', 'food_flash_sales',
    'loyalty_tiers', 'user_loyalty_tiers', 'delivery_slots',
    'cashback_offers', 'user_cashback_transactions', 'surge_charges',
    'delivery_instructions', 'user_subscriptions'
  ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_set_updated_at ON public.%I; CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();',
      t, t
    );
  END LOOP;
END $$;

-- ============================================================================
-- END OF V5.1 MIGRATION
-- ============================================================================
-- Verification queries (run after migration):
--
--   SELECT version FROM pgtypes.pg_type LIMIT 1;  -- sanity check
--   \dt public.*        -- confirm all new tables exist
--   \dv public.v_*      -- confirm all new views exist
--   SELECT * FROM public.loyalty_tiers;  -- should show 3 rows
--   SELECT * FROM public.v_user_dashboard WHERE user_id = '<your-auth-uid>';
--
-- Rollback (if needed):
--   DROP TABLE IF EXISTS public.user_subscriptions CASCADE;
--   DROP TABLE IF EXISTS public.delivery_instructions CASCADE;
--   DROP TABLE IF EXISTS public.surge_charges CASCADE;
--   DROP TABLE IF EXISTS public.user_cashback_transactions CASCADE;
--   DROP TABLE IF EXISTS public.cashback_offers CASCADE;
--   DROP TABLE IF EXISTS public.delivery_slots CASCADE;
--   DROP TABLE IF EXISTS public.user_loyalty_tiers CASCADE;
--   DROP TABLE IF EXISTS public.loyalty_tiers CASCADE;
--   DROP TABLE IF EXISTS public.food_flash_sale_items CASCADE;
--   DROP TABLE IF EXISTS public.food_flash_sales CASCADE;
--   DROP TABLE IF EXISTS public.blog_posts CASCADE;
--   DROP TABLE IF EXISTS public.food_brand_stores CASCADE;
--   DROP TABLE IF EXISTS public.food_brands CASCADE;
--   DROP TABLE IF EXISTS public.item_subscriptions CASCADE;
--   DROP TABLE IF EXISTS public.restock_alerts CASCADE;
--   DROP TABLE IF EXISTS public.item_bulk_discount_tiers CASCADE;
--   DROP TABLE IF EXISTS public.item_nutrition CASCADE;
--   ALTER TABLE public.items
--     DROP COLUMN IF EXISTS is_gluten_free, DROP COLUMN IF EXISTS is_spicy,
--     DROP COLUMN IF EXISTS is_chef_special, DROP COLUMN IF EXISTS is_best_seller,
--     DROP COLUMN IF EXISTS is_new, DROP COLUMN IF EXISTS allergens,
--     DROP COLUMN IF EXISTS ingredients, DROP COLUMN IF EXISTS subscription_eligible,
--     DROP COLUMN IF EXISTS restock_enabled;
--   ALTER TABLE public.stores
--     DROP COLUMN IF EXISTS bulk_order_discount_amount, DROP COLUMN IF EXISTS bulk_order_discount_percent,
--     DROP COLUMN IF EXISTS free_delivery_over_amount, DROP COLUMN IF EXISTS cashback_offer_id,
--     DROP COLUMN IF EXISTS loyalty_earn_rate, DROP COLUMN IF EXISTS subscription_enabled,
--     DROP COLUMN IF EXISTS is_express, DROP COLUMN IF EXISTS is_top_rated, DROP COLUMN IF EXISTS is_open_now_24h;
-- ============================================================================
