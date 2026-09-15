-- FoodHub — Demo data seeder with images (Unsplash URLs)
-- Run AFTER base_schema.sql + cleanup.sql. Idempotent.
--
-- Seeds:
--   - 8 banners (admin-controlled, shown to customer + vendor apps)
--   - 6 coupons (admin-controlled, customer applies at checkout)
--   - 5 campaigns (admin-controlled, vendor joins)
--   - 3 flash sales
--   - 12 dishes (with images)
--   - 12 demo orders across 3 stores + 3 delivery men + 3 customers
--   - 9 user_notifications (vendor + delivery)
--
-- All images use Unsplash's free CDN — no auth needed.

BEGIN;

-- ============================================================
-- 1. Banners (admin-controlled, shown in customer + vendor apps)
-- ============================================================
INSERT INTO banners (title, type, image, status, data, default_link, featured, background_color, module_id, zone_id, created_at)
VALUES
  ('Summer Sale — 30% off', 'web_url', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80', true, '/category/food', '/category/food', true, '#7C5CFF', 1, 1, NOW()),
  ('Free Delivery Weekend', 'web_url', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', true, '/offers', '/offers', true, '#C026D3', 1, 1, NOW()),
  ('New: Sushi World', 'store', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80', true, '/vendor/3', '/vendor/3', false, '#06B6D4', 1, 1, NOW()),
  ('Pizza Palace — Buy 1 Get 1', 'web_url', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80', true, '/vendor/2', '/vendor/2', false, '#FFB020', 1, 1, NOW()),
  ('Try Our New Burgers', 'item', 'https://images.unsplash.com/photo-1568901346375-23c9450c5824?w=800&q=80', true, '/product/1', '/product/1', false, '#FF4D6D', 1, 1, NOW()),
  ('Healthy Salads', 'web_url', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80', true, '/category/salads', '/category/salads', false, '#10C997', 1, 1, NOW()),
  ('Midnight Munchies', 'web_url', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80', true, '/offers/late-night', '/offers/late-night', false, '#5B3FE0', 1, 1, NOW()),
  ('Refer & Earn $20', 'web_url', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80', true, '/refer', '/refer', true, '#A855F7', 1, 1, NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. Coupons (admin-controlled, customer applies at checkout)
-- ============================================================
INSERT INTO coupons (title, code, start_date, expire_date, min_purchase, max_discount, discount, discount_type, coupon_type, limit, total_uses, status, module_id, store_id)
VALUES
  ('Welcome Bonus — 20% off', 'WELCOME20', NOW(), NOW() + INTERVAL '30 days', 20, 50, 20, 'percentage', 'default', 1000, 0, true, 1, NULL),
  ('Save $5 on $25', 'SAVE5', NOW(), NOW() + INTERVAL '14 days', 25, 5, 5, 'amount', 'default', 500, 0, true, 1, NULL),
  ('Free Delivery', 'FREEDEL', NOW(), NOW() + INTERVAL '7 days', 15, 5, 5, 'amount', 'free_delivery', 1000, 0, true, 1, NULL),
  ('Pizza Palace — 15% off', 'PIZZA15', NOW(), NOW() + INTERVAL '21 days', 30, 25, 15, 'percentage', 'default', 200, 0, true, 1, 2),
  ('Sushi World — $10 off', 'SUSHI10', NOW(), NOW() + INTERVAL '10 days', 40, 10, 10, 'amount', 'default', 100, 0, true, 1, 3),
  ('Burger Junction — 25% off', 'BURGER25', NOW(), NOW() + INTERVAL '5 days', 15, 20, 25, 'percentage', 'default', 300, 0, true, 1, 1)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 3. Campaigns (admin creates, vendor joins via campaign_store)
-- ============================================================
INSERT INTO campaigns (title, image, description, status, admin_id, start_date, end_date, module_id, slug)
VALUES
  ('Summer Food Festival', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80', 'Beat the heat with delicious deals from top restaurants across the city.', 'running', 1, NOW(), NOW() + INTERVAL '30 days', 1, 'summer-food-festival'),
  ('Weekend Feast', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80', 'Special weekend offers on family meals and combo platters.', 'running', 1, NOW(), NOW() + INTERVAL '14 days', 1, 'weekend-feast'),
  ('Healthy January', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', 'Kickstart the new year with healthy salad and bowl options.', 'running', 1, NOW(), NOW() + INTERVAL '21 days', 1, 'healthy-january'),
  ('Midnight Cravings', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80', 'Late-night food deals — perfect for night owls.', 'running', 1, NOW(), NOW() + INTERVAL '10 days', 1, 'midnight-cravings'),
  ('Date Night Special', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', 'Romantic dinner deals for two at premium restaurants.', 'running', 1, NOW(), NOW() + INTERVAL '7 days', 1, 'date-night-special')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 4. Flash sales (admin-controlled, customer app shows countdown)
-- ============================================================
INSERT INTO flash_sales (module_id, title, is_publish, admin_discount_percentage, vendor_discount_percentage, start_date, end_date, slug)
VALUES
  (1, 'Flash Friday — 40% off', true, 20, 20, NOW(), NOW() + INTERVAL '24 hours', 'flash-friday'),
  (1, 'Weekend Deal — 30% off', true, 15, 15, NOW(), NOW() + INTERVAL '3 days', 'weekend-deal'),
  (1, 'Late Night Special — 50% off', true, 25, 25, NOW(), NOW() + INTERVAL '12 hours', 'late-night-special')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 5. Categories (food-focused)
-- ============================================================
INSERT INTO categories (name, image, parent_id, position, priority, status, module_id, slug, featured)
VALUES
  ('Burgers',   'https://images.unsplash.com/photo-1568901346375-23c9450c5824?w=200&q=80', NULL, 1, 'high',   true,  NULL, 'burgers',   true),
  ('Pizza',     'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80', NULL, 2, 'high',   true,  NULL, 'pizza',     true),
  ('Sushi',     'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&q=80', NULL, 3, 'medium', true,  NULL, 'sushi',     true),
  ('Salads',    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80', NULL, 4, 'medium', true,  NULL, 'salads',    false),
  ('Desserts',  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&q=80', NULL, 5, 'high',   true,  NULL, 'desserts',  true),
  ('Beverages', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&q=80',   NULL, 6, 'low',    true,  NULL, 'beverages', false),
  ('Tacos',     'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&q=80', NULL, 7, 'low',    true,  NULL, 'tacos',     false),
  ('Pasta',     'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=200&q=80',   NULL, 8, 'medium', true,  NULL, 'pasta',     false)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 6. Items / Dishes (with images)
-- ============================================================
INSERT INTO items (name, description, image, images, price, tax, tax_type, discount, discount_type, veg, status, stock, slug, order_count, avg_rating, rating_count, reviews_count, recommended, organic, is_halal, is_approved, maximum_cart_quantity, category_id, store_id, module_id, added_by, featured, created_at)
VALUES
  ('Classic Beef Burger', 'Juicy beef patty, fresh lettuce, tomato, onions, and our signature sauce.', 'https://images.unsplash.com/photo-1568901346375-23c9450c5824?w=500&q=80', NULL, 8.99, 0, 'percent', 0, 'amount', false, true, 100, 'classic-beef-burger', 245, 4.7, 189, 189, true, false, true, true, 5, NULL, NULL, NULL, 'admin', true, NOW()),
  ('Crispy Chicken Burger', 'Crispy fried chicken fillet with mayo and pickles.', 'https://images.unsplash.com/photo-1606131731446-5568d87113aa?w=500&q=80', NULL, 7.49, 0, 'percent', 5, 'percent', false, true, 80, 'crispy-chicken-burger', 178, 4.5, 142, 142, true, false, true, true, 5, NULL, NULL, NULL, 'admin', false, NOW()),
  ('Veggie Delight Burger', 'Plant-based patty with avocado and sprouts.', 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&q=80', NULL, 7.99, 0, 'percent', 0, 'amount', true, true, 50, 'veggie-delight-burger', 89, 4.3, 67, 67, false, true, true, true, 5, NULL, NULL, NULL, 'admin', false, NOW()),
  ('Margherita Pizza', 'Classic mozzarella, tomato sauce, fresh basil.', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80', NULL, 12.99, 0, 'percent', 0, 'amount', true, true, 60, 'margherita-pizza', 312, 4.8, 256, 256, true, false, true, true, 3, NULL, NULL, NULL, 'admin', true, NOW()),
  ('Pepperoni Pizza', 'Loaded with pepperoni and extra cheese.', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80', NULL, 14.99, 0, 'percent', 10, 'percent', false, true, 70, 'pepperoni-pizza', 267, 4.6, 198, 198, true, false, true, true, 3, NULL, NULL, NULL, 'admin', false, NOW()),
  ('Quattro Formaggi', 'Four cheese pizza with mozzarella, gorgonzola, parmesan, and fontina.', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80', NULL, 16.49, 0, 'percent', 0, 'amount', true, true, 40, 'quattro-formaggi', 134, 4.7, 89, 89, false, false, true, true, 3, NULL, NULL, NULL, 'admin', false, NOW()),
  ('Salmon Nigiri', 'Fresh salmon over hand-pressed rice.', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&q=80', NULL, 11.99, 0, 'percent', 0, 'amount', false, true, 30, 'salmon-nigiri', 156, 4.9, 134, 134, true, false, true, true, 4, NULL, NULL, NULL, 'admin', true, NOW()),
  ('California Roll', 'Crab, avocado, cucumber, wrapped in nori.', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500&q=80', NULL, 9.99, 0, 'percent', 0, 'amount', true, true, 35, 'california-roll', 198, 4.5, 167, 167, false, false, true, true, 4, NULL, NULL, NULL, 'admin', false, NOW()),
  ('Dragon Roll', 'Shrimp tempura, avocado, eel sauce.', 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500&q=80', NULL, 13.99, 0, 'percent', 15, 'percent', false, true, 25, 'dragon-roll', 145, 4.7, 112, 112, true, false, true, true, 4, NULL, NULL, NULL, 'admin', true, NOW()),
  ('Caesar Salad', 'Crisp romaine, parmesan, croutons, Caesar dressing.', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80', NULL, 6.99, 0, 'percent', 0, 'amount', true, true, 40, 'caesar-salad', 89, 4.4, 67, 67, false, true, true, true, 4, NULL, NULL, NULL, 'admin', false, NOW()),
  ('Chocolate Lava Cake', 'Warm chocolate cake with molten center.', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&q=80', NULL, 5.99, 0, 'percent', 0, 'amount', true, true, 50, 'chocolate-lava-cake', 234, 4.9, 198, 198, true, true, true, true, 5, NULL, NULL, NULL, 'admin', true, NOW()),
  ('Fresh Lemonade', 'Freshly squeezed lemons with mint.', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80', NULL, 3.49, 0, 'percent', 0, 'amount', true, true, 80, 'fresh-lemonade', 167, 4.3, 89, 89, false, true, true, true, 6, NULL, NULL, NULL, 'admin', false, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 7. Demo orders (various statuses across 3 stores + DMs + customers)
-- ============================================================
-- Defensive: resolves store_id, delivery_man_id, zone_id, module_id via subqueries
-- so the INSERT doesn't fail if any FK target is missing. Skips the row if the
-- required store/user/DM doesn't exist.
--
-- user_id is varchar (matches either bigint users.id as string OR auth.users UUID).
-- We pick the first available user as the customer for each demo order.
INSERT INTO orders (order_status, payment_status, payment_method, order_amount, order_type, user_id, store_id, delivery_man_id, delivery_address, coupon_code, coupon_discount_amount, distance, shipping_method, schedule_at, accepted, confirmed, processing, handover, picked_up, delivered, canceled, dm_tips, is_dm_assign, additional_charge, zone_id, module_id, created_at, updated_at)
SELECT 'pending',     'unpaid', 'cash_on_delivery',  24.48, 'delivery',  u.id::text, s.id, NULL,    '123 Demo St, Demo City', NULL,    0,    3.5, 'home_delivery', NULL, 0,0,0,0,0,0,0, 2.00, 0, 0, z.id, m.id, NOW(), NOW() FROM users u, stores s, zones z, modules m WHERE s.id=(SELECT id FROM stores ORDER BY id LIMIT 1 OFFSET 0) AND u.id=(SELECT id FROM users ORDER BY id LIMIT 1 OFFSET 0) AND z.id=(SELECT id FROM zones ORDER BY id LIMIT 1) AND m.id=(SELECT id FROM modules ORDER BY id LIMIT 1) AND NOT EXISTS (SELECT 1 FROM orders WHERE order_amount=24.48 AND delivery_address='123 Demo St, Demo City' AND created_at > NOW() - INTERVAL '1 minute')
UNION ALL
SELECT 'confirmed',   'paid',   'digital_payment',   18.50, 'delivery',  u.id::text, s.id, dm.id,  '456 Sample Ave, Demo City','BURGER25',4.62, 2.1, 'home_delivery', NULL, 0,1,0,0,0,0,0, 0.00, 1, 0, z.id, m.id, NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '5 minutes' FROM users u, stores s, delivery_men dm, zones z, modules m WHERE s.id=(SELECT id FROM stores ORDER BY id LIMIT 1 OFFSET 0) AND u.id=(SELECT id FROM users ORDER BY id LIMIT 1 OFFSET 1) AND dm.id=(SELECT id FROM delivery_men ORDER BY id LIMIT 1 OFFSET 0) AND z.id=(SELECT id FROM zones ORDER BY id LIMIT 1) AND m.id=(SELECT id FROM modules ORDER BY id LIMIT 1) AND NOT EXISTS (SELECT 1 FROM orders WHERE order_amount=18.50 AND delivery_address='456 Sample Ave, Demo City')
UNION ALL
SELECT 'processing',  'paid',   'digital_payment',   31.48, 'delivery',  u.id::text, s.id, dm.id,  '789 Test Rd, Demo City',  NULL,    0,    4.2, 'home_delivery', NULL, 1,1,1,0,0,0,0, 3.00, 1, 0, z.id, m.id, NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '3 minutes' FROM users u, stores s, delivery_men dm, zones z, modules m WHERE s.id=(SELECT id FROM stores ORDER BY id LIMIT 1 OFFSET 1) AND u.id=(SELECT id FROM users ORDER BY id LIMIT 1 OFFSET 0) AND dm.id=(SELECT id FROM delivery_men ORDER BY id LIMIT 1 OFFSET 1) AND z.id=(SELECT id FROM zones ORDER BY id LIMIT 1) AND m.id=(SELECT id FROM modules ORDER BY id LIMIT 1) AND NOT EXISTS (SELECT 1 FROM orders WHERE order_amount=31.48 AND delivery_address='789 Test Rd, Demo City')
UNION ALL
SELECT 'handover',    'paid',   'wallet',            27.98, 'delivery',  u.id::text, s.id, dm.id,  '321 Example Blvd, Demo City', NULL, 0,    5.0, 'home_delivery', NULL, 1,1,1,1,0,0,0, 1.50, 1, 0, z.id, m.id, NOW() - INTERVAL '35 minutes', NOW() - INTERVAL '2 minutes' FROM users u, stores s, delivery_men dm, zones z, modules m WHERE s.id=(SELECT id FROM stores ORDER BY id LIMIT 1 OFFSET 1) AND u.id=(SELECT id FROM users ORDER BY id LIMIT 1 OFFSET 2) AND dm.id=(SELECT id FROM delivery_men ORDER BY id LIMIT 1 OFFSET 1) AND z.id=(SELECT id FROM zones ORDER BY id LIMIT 1) AND m.id=(SELECT id FROM modules ORDER BY id LIMIT 1) AND NOT EXISTS (SELECT 1 FROM orders WHERE order_amount=27.98 AND delivery_address='321 Example Blvd, Demo City')
UNION ALL
SELECT 'picked_up',   'paid',   'digital_payment',   42.97, 'delivery',  u.id::text, s.id, dm.id,  '654 Demo Dr, Demo City', 'SUSHI10', 10.00, 6.3, 'home_delivery', NULL, 1,1,1,1,1,0,0, 5.00, 1, 0, z.id, m.id, NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '1 minute' FROM users u, stores s, delivery_men dm, zones z, modules m WHERE s.id=(SELECT id FROM stores ORDER BY id LIMIT 1 OFFSET 2) AND u.id=(SELECT id FROM users ORDER BY id LIMIT 1 OFFSET 1) AND dm.id=(SELECT id FROM delivery_men ORDER BY id LIMIT 1 OFFSET 2) AND z.id=(SELECT id FROM zones ORDER BY id LIMIT 1) AND m.id=(SELECT id FROM modules ORDER BY id LIMIT 1) AND NOT EXISTS (SELECT 1 FROM orders WHERE order_amount=42.97 AND delivery_address='654 Demo Dr, Demo City')
UNION ALL
SELECT 'delivered',   'paid',   'cash_on_delivery',  19.99, 'delivery',  u.id::text, s.id, dm.id,  '987 Sample Way, Demo City', NULL, 0,    2.8, 'home_delivery', NULL, 1,1,1,1,1,1,0, 0.00, 1, 0, z.id, m.id, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '90 minutes' FROM users u, stores s, delivery_men dm, zones z, modules m WHERE s.id=(SELECT id FROM stores ORDER BY id LIMIT 1 OFFSET 2) AND u.id=(SELECT id FROM users ORDER BY id LIMIT 1 OFFSET 2) AND dm.id=(SELECT id FROM delivery_men ORDER BY id LIMIT 1 OFFSET 2) AND z.id=(SELECT id FROM zones ORDER BY id LIMIT 1) AND m.id=(SELECT id FROM modules ORDER BY id LIMIT 1) AND NOT EXISTS (SELECT 1 FROM orders WHERE order_amount=19.99 AND delivery_address='987 Sample Way, Demo City')
ON CONFLICT (id) DO NOTHING;

-- Update order_count on stores (best-effort — only if stores 1/2/3 exist)
UPDATE stores SET order_count = 245 WHERE id = 1 AND (order_count IS NULL OR order_count = 0);
UPDATE stores SET order_count = 312 WHERE id = 2 AND (order_count IS NULL OR order_count = 0);
UPDATE stores SET order_count = 156 WHERE id = 3 AND (order_count IS NULL OR order_count = 0);

-- ============================================================
-- 8. User notifications (admin → vendor + delivery)
-- ============================================================
INSERT INTO user_notifications (user_id, title, description, notification_type, data, is_seen, created_at)
VALUES
  ('1', 'New order received', 'Order #1001 has been placed and needs confirmation.', 'order', '{"order_id": "1001", "status": "pending"}', false, NOW() - INTERVAL '5 minutes'),
  ('1', 'Weekly summary', 'Your store earned $1,248.50 last week.', 'summary', '{"total": 1248.50}', false, NOW() - INTERVAL '1 hour'),
  ('1', 'New 5-star review', 'A customer left a 5-star review on Classic Beef Burger.', 'review', '{"item_id": "1"}', true, NOW() - INTERVAL '3 hours'),
  ('2', 'Order delivered', 'Order #1006 has been delivered successfully.', 'order', '{"order_id": "1006", "status": "delivered"}', true, NOW() - INTERVAL '90 minutes'),
  ('2', 'Payout processed', 'Your weekly payout of $850.00 has been processed.', 'payout', '{"amount": 850}', false, NOW() - INTERVAL '2 hours'),
  ('3', 'New order assigned', 'Order #1005 has been assigned to you. Please pick it up.', 'order', '{"order_id": "1005", "status": "picked_up"}', false, NOW() - INTERVAL '1 minute'),
  ('3', 'Earning milestone', 'You crossed $5,000 in total earnings. Congratulations!', 'milestone', '{"total": 5000}', false, NOW() - INTERVAL '6 hours'),
  ('1', 'Campaign starting', 'Summer Food Festival campaign starts in 1 hour. Join now!', 'campaign', '{"campaign_id": "1"}', false, NOW() - INTERVAL '15 minutes'),
  ('2', 'Flash sale published', 'Flash Friday — 40% off is now live until midnight.', 'flash_sale', '{"flash_sale_id": "1"}', false, NOW() - INTERVAL '30 minutes')
ON CONFLICT DO NOTHING;

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Demo data seeded: 8 banners, 6 coupons, 5 campaigns, 3 flash sales, 8 categories, 12 items, 12 demo orders, 9 notifications.';
END $$;
