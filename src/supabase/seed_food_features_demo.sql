-- ============================================================================
-- FoodHub Customer App V5.1 — Demo Seed Data for Grocery-Ported Food Features
-- ----------------------------------------------------------------------------
-- Run AFTER migration_v5_1_food_features.sql.
-- Inserts realistic demo data for: nutrition, bulk tiers, brands, blogs,
-- flash sales, delivery slots, cashback offers, surge (none active).
-- All item_id / store_id references assume the demo data created by
-- admin_panel/supabase/seed_demo.sql. Adjust IDs to match your DB.
-- ============================================================================

-- ----------------------- Item nutrition facts -----------------------
INSERT INTO public.item_nutrition (item_id, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, serving_size, servings_per_container) VALUES
  (101, 650, 32, 42, 38, 3, 8, 980, '1 burger (250g)', 1),
  (102, 285, 12, 36, 10, 2, 4, 640, '1 slice (110g)', 8),
  (103, 350, 14, 48, 7,  2, 6, 590, '1 roll (200g)',  1),
  (104, 220, 11, 22, 10, 4, 2, 480, '1 taco (110g)',   3),
  (105, 520, 18, 78, 14, 5, 6, 720, '1 plate (330g)',  1),
  (106, 280, 9,  18, 19, 6, 5, 410, '1 bowl (240g)',   1),
  (107, 410, 6,  52, 21, 1, 38, 230, '1 slice (140g)', 1),
  (108, 180, 2,  42, 1,  0, 40, 60, '1 glass (350ml)', 1)
ON CONFLICT (item_id) DO NOTHING;

-- ----------------------- Allergen + ingredient arrays on items -----------------------
UPDATE public.items SET
  allergens   = ARRAY['gluten','dairy','sesame','egg'],
  ingredients = ARRAY['Beef patty','Sesame bun','Cheddar cheese','Lettuce','Tomato','Onion','Pickles','House sauce'],
  is_best_seller = TRUE
WHERE id = 101;

UPDATE public.items SET
  allergens   = ARRAY['gluten','dairy'],
  ingredients = ARRAY['Pizza dough','Mozzarella','Tomato sauce','Basil','Olive oil','Oregano'],
  is_chef_special = TRUE,
  subscription_eligible = TRUE
WHERE id = 102;

UPDATE public.items SET
  allergens   = ARRAY['fish','soy','shellfish'],
  ingredients = ARRAY['Sushi rice','Nori','Fresh salmon','Avocado','Cucumber','Soy sauce','Wasabi','Pickled ginger'],
  is_new = TRUE
WHERE id = 103;

UPDATE public.items SET
  allergens   = ARRAY['gluten','dairy'],
  ingredients = ARRAY['Corn tortilla','Grilled chicken','Onion','Cilantro','Lime','Salsa verde'],
  is_spicy = TRUE
WHERE id = 104;

UPDATE public.items SET
  allergens   = ARRAY['gluten','egg','dairy'],
  ingredients = ARRAY['Penne pasta','Marinara sauce','Parmesan','Garlic','Basil','Olive oil']
WHERE id = 105;

UPDATE public.items SET
  allergens   = ARRAY['tree_nuts'],
  ingredients = ARRAY['Mixed greens','Cherry tomato','Cucumber','Olive oil','Lemon','Almond','Feta'],
  is_organic = TRUE,
  is_gluten_free = TRUE
WHERE id = 106;

UPDATE public.items SET
  allergens   = ARRAY['dairy','egg','gluten'],
  ingredients = ARRAY['Dark chocolate','Butter','Sugar','Eggs','Flour','Vanilla extract']
WHERE id = 107;

UPDATE public.items SET
  allergens   = ARRAY[]::TEXT[],
  ingredients = ARRAY['Sparkling water','Lemon','Mint','Ice'],
  is_organic = TRUE,
  is_gluten_free = TRUE,
  subscription_eligible = TRUE
WHERE id = 108;

-- ----------------------- Bulk discount tiers (shared ladder) -----------------------
INSERT INTO public.item_bulk_discount_tiers (item_id, store_id, min_qty, percent, label) VALUES
  (101, 1, 3,  5,  '3+ portions · 5% off'),
  (101, 1, 5,  10, '5+ portions · 10% off'),
  (101, 1, 10, 15, '10+ portions · 15% off'),
  (101, 1, 20, 20, '20+ portions · 20% off'),
  (102, 2, 3,  5,  '3+ portions · 5% off'),
  (102, 2, 5,  10, '5+ portions · 10% off'),
  (102, 2, 10, 15, '10+ portions · 15% off'),
  (102, 2, 20, 20, '20+ portions · 20% off')
ON CONFLICT (item_id, min_qty) DO NOTHING;

-- ----------------------- Store-level bulk discount + free-delivery threshold -----------------------
UPDATE public.stores SET
  bulk_order_discount_amount  = 100,
  bulk_order_discount_percent = 5,
  free_delivery_over_amount   = 20,
  loyalty_earn_rate           = 1.0,
  subscription_enabled        = TRUE,
  is_express                  = TRUE,
  is_top_rated                = TRUE
WHERE id IN (1, 2);

UPDATE public.stores SET
  free_delivery_over_amount = 25,
  loyalty_earn_rate         = 1.5,
  is_top_rated              = TRUE
WHERE id = 3;

UPDATE public.stores SET
  bulk_order_discount_amount  = 80,
  bulk_order_discount_percent = 5,
  free_delivery_over_amount   = 15,
  loyalty_earn_rate           = 1.0,
  is_express                  = TRUE
WHERE id = 4;

-- ----------------------- Food brands -----------------------
INSERT INTO public.food_brands (name, slug, logo_url, description, is_featured, is_verified, cuisine_types) VALUES
  ('Burger King',     'burger-king',     '🍔', 'Flame-grilled burgers worldwide',     TRUE,  TRUE, ARRAY['American','Fast Food']),
  ('Domino''s',       'dominos',         '🍕', 'Hot, fresh pizza delivered in 30 min', TRUE,  TRUE, ARRAY['Italian','Pizza']),
  ('Subway',          'subway',          '🥪', 'Eat fresh — build-your-own subs',     FALSE, TRUE, ARRAY['American','Healthy']),
  ('Starbucks',       'starbucks',       '☕', 'Coffee, frappuccinos & baked treats', TRUE,  TRUE, ARRAY['Beverages','Cafe']),
  ('KFC',             'kfc',             '🍗', 'Finger lickin'' good fried chicken',   TRUE,  TRUE, ARRAY['American','Fried Chicken']),
  ('Baskin Robbins',  'baskin-robbins',  '🍦', '31 flavours of pure happiness',       FALSE, TRUE, ARRAY['Desserts','Ice Cream'])
ON CONFLICT (slug) DO NOTHING;

-- Map brands to demo stores (assume store 1 = Burger Junction, etc.)
INSERT INTO public.food_brand_stores (brand_id, store_id) VALUES
  (1, 1), -- Burger King → Burger Junction
  (2, 2), -- Domino's → Pizza Palace
  (3, 1), -- Subway → Burger Junction (also serves subs)
  (5, 4)  -- KFC → Taco Fiesta (fried chicken overlap)
ON CONFLICT DO NOTHING;

-- ----------------------- Blog posts -----------------------
INSERT INTO public.blog_posts (title, slug, excerpt, cover_image_url, author_name, category, reading_time_min, published_at, tags) VALUES
  ('The Secret Behind a Perfect Wood-Fired Pizza', 'perfect-wood-fired-pizza',
   'From dough hydration to oven temperature — chef Marco shares the four principles that turn a good pizza into a great one.',
   '🍕', 'Chef Marco Rossi', 'chef_stories', 6, '2026-09-01T10:00:00Z', ARRAY['pizza','italian','technique']),
  ('5 Ramen Styles Every Foodie Must Try Once', '5-ramen-styles-foodies',
   'Tonkotsu, shoyu, miso, shio, tsukemen — a deep dive into Japan''s most beloved bowl and where to find the best version near you.',
   '🍜', 'Aiko Tanaka', 'food_guides', 8, '2026-08-28T08:00:00Z', ARRAY['ramen','japanese','guide']),
  ('How to Build the Ultimate Burger at Home', 'ultimate-burger-at-home',
   'Patty thickness, bun-to-meat ratio, the perfect melt — a step-by-step recipe to recreate restaurant-quality burgers in your kitchen.',
   '🍔', 'James Wilson', 'recipes', 10, '2026-08-22T12:00:00Z', ARRAY['burger','recipe','american']),
  ('The Rise of Plant-Based Comfort Food', 'rise-of-plant-based-comfort-food',
   'Why 2026 is the year of vegan burgers, dairy-free ice cream, and mushroom-based sushi — and which kitchens are leading the charge.',
   '🌱', 'Priya Sharma', 'trends', 7, '2026-08-15T15:00:00Z', ARRAY['vegan','trends','plant-based'])
ON CONFLICT (slug) DO NOTHING;

-- ----------------------- Flash sales -----------------------
INSERT INTO public.food_flash_sales (title, subtitle, start_date, end_date, discount_percent, total_stock, sold_count, is_active) VALUES
  ('⚡ Lunch Hour Madness',
   'Up to 40% off — only between 12 PM and 2 PM',
   '2026-09-08 12:00:00+00', '2026-09-08 14:00:00+00', 40, 200, 137, TRUE),
  ('🌙 Late Night Cravings',
   'Buy 1 Get 1 Free on desserts & beverages',
   '2026-09-08 22:00:00+00', '2026-09-09 02:00:00+00', 50, 150, 42, TRUE)
ON CONFLICT DO NOTHING;

-- ----------------------- Delivery slots (today + tomorrow) -----------------------
INSERT INTO public.delivery_slots (store_id, label, slot_date, start_time, end_time, is_available, is_express, extra_charge, max_orders, booked_orders) VALUES
  (1, 'ASAP · 25–35 min',       CURRENT_DATE, '12:00', '13:00', TRUE,  TRUE,  0, 50, 0),
  (1, 'Today · 12–1 PM',         CURRENT_DATE, '12:00', '13:00', TRUE,  FALSE, 0, 50, 12),
  (1, 'Today · 1–2 PM',          CURRENT_DATE, '13:00', '14:00', TRUE,  FALSE, 0, 50, 8),
  (1, 'Today · 6–7 PM',          CURRENT_DATE, '18:00', '19:00', TRUE,  FALSE, 0, 50, 22),
  (1, 'Today · 7–8 PM (Dinner)', CURRENT_DATE, '19:00', '20:00', TRUE,  FALSE, 0, 50, 35),
  (1, 'Tomorrow · 12–1 PM',      CURRENT_DATE + 1, '12:00', '13:00', TRUE, FALSE, 0, 50, 0),
  (1, 'Tomorrow · 7–8 PM',       CURRENT_DATE + 1, '19:00', '20:00', TRUE, FALSE, 0, 50, 5)
ON CONFLICT DO NOTHING;

-- ----------------------- Cashback offers -----------------------
INSERT INTO public.cashback_offers (title, description, percent, min_order_amount, max_cashback, status, starts_at, expires_at) VALUES
  ('Weekend Feast Cashback',
   'Get 10% cashback on orders above $25 — every Saturday & Sunday',
   10, 25, 15, 'active', '2026-01-01 00:00:00+00', '2026-12-31 23:59:59+00'),
  ('First Order Cashback',
   'New to FoodHub? Get 15% cashback on your first order',
   15, 10, 10, 'active', '2026-01-01 00:00:00+00', '2026-12-31 23:59:59+00'),
  ('Late Night Cravings',
   '5% cashback on orders between 11 PM and 2 AM',
   5, 15, 8, 'active', '2026-01-01 00:00:00+00', '2026-12-31 23:59:59+00')
ON CONFLICT DO NOTHING;

-- Link active cashback to demo stores
UPDATE public.stores SET cashback_offer_id = (SELECT id FROM public.cashback_offers WHERE title = 'Weekend Feast Cashback' LIMIT 1) WHERE id IN (1, 2, 3, 4);

-- ----------------------- Verify -----------------------
SELECT 'Demo data inserted for V5.1 grocery-ported food features' AS message,
       (SELECT COUNT(*) FROM public.item_nutrition)              AS nutrition_rows,
       (SELECT COUNT(*) FROM public.item_bulk_discount_tiers)    AS bulk_tier_rows,
       (SELECT COUNT(*) FROM public.food_brands)                 AS brand_rows,
       (SELECT COUNT(*) FROM public.blog_posts)                  AS blog_rows,
       (SELECT COUNT(*) FROM public.food_flash_sales)            AS flash_sale_rows,
       (SELECT COUNT(*) FROM public.delivery_slots)              AS delivery_slot_rows,
       (SELECT COUNT(*) FROM public.cashback_offers)             AS cashback_rows;
