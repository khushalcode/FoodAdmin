// ============================================================================
// FoodHub — V5.1 Grocery-Ported Food Feature Demo Data
// ----------------------------------------------------------------------------
// Mock data for the grocery-style features now layered onto the food module:
//   - Nutrition info, allergens, ingredients
//   - Bulk discount tiers
//   - Restock alerts
//   - Item subscriptions
//   - Flash sales (food-focused)
//   - Food brands
//   - Blog posts (food journal)
//   - Loyalty tiers
//   - Delivery slots
//   - Cashback offers
//   - Surge charges
//
// Used as fallback when REST API / Supabase are unavailable, mirroring the
// pattern in src/data/demo-data.ts.
// ============================================================================

import type {
  ItemNutrition,
  BulkDiscountTier,
  ItemSubscription,
  BlogPost,
  FoodBrand,
  FoodFlashSale,
  LoyaltyTier,
  DeliverySlot,
  CashbackOffer,
  SurgeCharge,
  RestockAlert,
} from '@/types';
import { FoodCopy } from '@/constants/food_copy';

// ----------------------------------------------------------------- NUTRITION
// Per-dish nutrition facts — believable real-world values per serving.
export const DEMO_NUTRITION: Record<number, ItemNutrition> = {
  // Burger (id 101)
  101: { calories: 650, protein_g: 32, carbs_g: 42, fat_g: 38, fiber_g: 3, sugar_g: 8, sodium_mg: 980, serving_size: '1 burger (250g)', servings_per_container: 1 },
  // Pizza slice (id 102)
  102: { calories: 285, protein_g: 12, carbs_g: 36, fat_g: 10, fiber_g: 2, sugar_g: 4, sodium_mg: 640, serving_size: '1 slice (110g)', servings_per_container: 8 },
  // Sushi roll (id 103)
  103: { calories: 350, protein_g: 14, carbs_g: 48, fat_g: 7, fiber_g: 2, sugar_g: 6, sodium_mg: 590, serving_size: '1 roll (200g)', servings_per_container: 1 },
  // Tacos (id 104)
  104: { calories: 220, protein_g: 11, carbs_g: 22, fat_g: 10, fiber_g: 4, sugar_g: 2, sodium_mg: 480, serving_size: '1 taco (110g)', servings_per_container: 3 },
  // Pasta (id 105)
  105: { calories: 520, protein_g: 18, carbs_g: 78, fat_g: 14, fiber_g: 5, sugar_g: 6, sodium_mg: 720, serving_size: '1 plate (330g)', servings_per_container: 1 },
  // Salad (id 106)
  106: { calories: 280, protein_g: 9,  carbs_g: 18, fat_g: 19, fiber_g: 6, sugar_g: 5, sodium_mg: 410, serving_size: '1 bowl (240g)', servings_per_container: 1 },
  // Dessert (id 107)
  107: { calories: 410, protein_g: 6,  carbs_g: 52, fat_g: 21, fiber_g: 1, sugar_g: 38, sodium_mg: 230, serving_size: '1 slice (140g)', servings_per_container: 1 },
  // Beverage (id 108)
  108: { calories: 180, protein_g: 2,  carbs_g: 42, fat_g: 1,  fiber_g: 0, sugar_g: 40, sodium_mg: 60,  serving_size: '1 glass (350ml)', servings_per_container: 1 },
};

// ----------------------------------------------------------------- ALLERGENS
// Common allergen tags per dish.
export const DEMO_ALLERGENS: Record<number, string[]> = {
  101: ['gluten', 'dairy', 'sesame', 'egg'],
  102: ['gluten', 'dairy'],
  103: ['fish', 'soy', 'shellfish'],
  104: ['gluten', 'dairy'],
  105: ['gluten', 'egg', 'dairy'],
  106: ['tree_nuts'],
  107: ['dairy', 'egg', 'gluten'],
  108: [],
};

// ----------------------------------------------------------------- INGREDIENTS
export const DEMO_INGREDIENTS: Record<number, string[]> = {
  101: ['Beef patty', 'Sesame bun', 'Cheddar cheese', 'Lettuce', 'Tomato', 'Onion', 'Pickles', 'House sauce'],
  102: ['Pizza dough', 'Mozzarella', 'Tomato sauce', 'Basil', 'Olive oil', 'Oregano'],
  103: ['Sushi rice', 'Nori', 'Fresh salmon', 'Avocado', 'Cucumber', 'Soy sauce', 'Wasabi', 'Pickled ginger'],
  104: ['Corn tortilla', 'Grilled chicken', 'Onion', 'Cilantro', 'Lime', 'Salsa verde'],
  105: ['Penne pasta', 'Marinara sauce', 'Parmesan', 'Garlic', 'Basil', 'Olive oil'],
  106: ['Mixed greens', 'Cherry tomato', 'Cucumber', 'Olive oil', 'Lemon', 'Almond', 'Feta'],
  107: ['Dark chocolate', 'Butter', 'Sugar', 'Eggs', 'Flour', 'Vanilla extract'],
  108: ['Sparkling water', 'Lemon', 'Mint', 'Ice'],
};

// ----------------------------------------------------------------- BULK TIERS
// Shared bulk-discount ladder — applied at checkout when qty >= min_qty.
export const DEMO_BULK_TIERS: BulkDiscountTier[] = FoodCopy.bulkDiscountTiers.map((t) => ({
  min_qty: t.minQty,
  percent: t.percent,
  label: t.label,
}));

// ----------------------------------------------------------------- RESTOCK ALERTS
export const DEMO_RESTOCK_ALERTS: RestockAlert[] = [
  {
    id: 1,
    user_id: 'demo-customer',
    item_id: 109,
    item_name: 'Truffle Mushroom Pizza',
    store_id: 2,
    store_name: 'Pizza Palace',
    status: 'waiting',
    created_at: '2026-09-05T10:30:00Z',
    expires_at: '2026-09-15T10:30:00Z',
  },
  {
    id: 2,
    user_id: 'demo-customer',
    item_id: 110,
    item_name: 'Dragon Roll Sushi',
    store_id: 3,
    store_name: 'Sushi World',
    status: 'notified',
    created_at: '2026-09-04T14:15:00Z',
    notified_at: '2026-09-08T09:00:00Z',
  },
];

// ----------------------------------------------------------------- SUBSCRIPTIONS
export const DEMO_SUBSCRIPTIONS: ItemSubscription[] = [
  {
    id: 1,
    user_id: 'demo-customer',
    item_id: 102,
    item_name: 'Margherita Pizza',
    store_id: 2,
    store_name: 'Pizza Palace',
    quantity: 1,
    frequency_days: 7,
    next_delivery_at: '2026-09-15T19:00:00Z',
    total_deliveries: 12,
    completed_deliveries: 4,
    status: 'active',
    discount_percent: 15,
    created_at: '2026-08-25T12:00:00Z',
  },
  {
    id: 2,
    user_id: 'demo-customer',
    item_id: 108,
    item_name: 'Fresh Lemonade',
    store_id: 1,
    store_name: 'Burger Junction',
    quantity: 2,
    frequency_days: 14,
    next_delivery_at: '2026-09-22T15:00:00Z',
    total_deliveries: 24,
    completed_deliveries: 8,
    status: 'active',
    discount_percent: 15,
    created_at: '2026-07-12T10:00:00Z',
  },
];

// ----------------------------------------------------------------- FLASH SALES
export const DEMO_FLASH_SALES: FoodFlashSale[] = [
  {
    id: 1,
    title: '⚡ Lunch Hour Madness',
    subtitle: 'Up to 40% off — only between 12 PM and 2 PM',
    image_url: null,
    start_date: '2026-09-08T12:00:00Z',
    end_date: '2026-09-08T14:00:00Z',
    discount_percent: 40,
    items: [],
    total_stock: 200,
    sold_count: 137,
    is_active: true,
  },
  {
    id: 2,
    title: '🌙 Late Night Cravings',
    subtitle: 'Buy 1 Get 1 Free on desserts & beverages',
    image_url: null,
    start_date: '2026-09-08T22:00:00Z',
    end_date: '2026-09-09T02:00:00Z',
    discount_percent: 50,
    items: [],
    total_stock: 150,
    sold_count: 42,
    is_active: true,
  },
];

// ----------------------------------------------------------------- FOOD BRANDS
export const DEMO_FOOD_BRANDS: FoodBrand[] = [
  { id: 1, name: 'Burger King', slug: 'burger-king', logo_url: '🍔', cover_image_url: null, description: 'Flame-grilled burgers worldwide', item_count: 24, store_count: 8, is_featured: true, is_verified: true, cuisine_types: ['American', 'Fast Food'] },
  { id: 2, name: 'Domino\'s', slug: 'dominos', logo_url: '🍕', cover_image_url: null, description: 'Hot, fresh pizza delivered in 30 min', item_count: 32, store_count: 12, is_featured: true, is_verified: true, cuisine_types: ['Italian', 'Pizza'] },
  { id: 3, name: 'Subway', slug: 'subway', logo_url: '🥪', cover_image_url: null, description: 'Eat fresh — build-your-own subs', item_count: 18, store_count: 6, is_featured: false, is_verified: true, cuisine_types: ['American', 'Healthy'] },
  { id: 4, name: 'Starbucks', slug: 'starbucks', logo_url: '☕', cover_image_url: null, description: 'Coffee, frappuccinos & baked treats', item_count: 40, store_count: 14, is_featured: true, is_verified: true, cuisine_types: ['Beverages', 'Cafe'] },
  { id: 5, name: 'KFC', slug: 'kfc', logo_url: '🍗', cover_image_url: null, description: 'Finger lickin\' good fried chicken', item_count: 22, store_count: 10, is_featured: true, is_verified: true, cuisine_types: ['American', 'Fried Chicken'] },
  { id: 6, name: 'Baskin Robbins', slug: 'baskin-robbins', logo_url: '🍦', cover_image_url: null, description: '31 flavours of pure happiness', item_count: 31, store_count: 4, is_featured: false, is_verified: true, cuisine_types: ['Desserts', 'Ice Cream'] },
];

// ----------------------------------------------------------------- BLOG POSTS
export const DEMO_BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: 'The Secret Behind a Perfect Wood-Fired Pizza',
    slug: 'perfect-wood-fired-pizza',
    excerpt: 'From dough hydration to oven temperature — chef Marco shares the four principles that turn a good pizza into a great one.',
    cover_image_url: '🍕',
    author_name: 'Chef Marco Rossi',
    author_avatar_url: null,
    category: 'chef_stories',
    reading_time_min: 6,
    published_at: '2026-09-01T10:00:00Z',
    tags: ['pizza', 'italian', 'technique'],
    views_count: 12400,
    likes_count: 980,
  },
  {
    id: 2,
    title: '5 Ramen Styles Every Foodie Must Try Once',
    slug: '5-ramen-styles-foodies',
    excerpt: 'Tonkotsu, shoyu, miso, shio, tsukemen — a deep dive into Japan\'s most beloved bowl and where to find the best version near you.',
    cover_image_url: '🍜',
    author_name: 'Aiko Tanaka',
    author_avatar_url: null,
    category: 'food_guides',
    reading_time_min: 8,
    published_at: '2026-08-28T08:00:00Z',
    tags: ['ramen', 'japanese', 'guide'],
    views_count: 9800,
    likes_count: 720,
  },
  {
    id: 3,
    title: 'How to Build the Ultimate Burger at Home',
    slug: 'ultimate-burger-at-home',
    excerpt: 'Patty thickness, bun-to-meat ratio, the perfect melt — a step-by-step recipe to recreate restaurant-quality burgers in your kitchen.',
    cover_image_url: '🍔',
    author_name: 'James Wilson',
    author_avatar_url: null,
    category: 'recipes',
    reading_time_min: 10,
    published_at: '2026-08-22T12:00:00Z',
    tags: ['burger', 'recipe', 'american'],
    views_count: 18600,
    likes_count: 1450,
  },
  {
    id: 4,
    title: 'The Rise of Plant-Based Comfort Food',
    slug: 'rise-of-plant-based-comfort-food',
    excerpt: 'Why 2026 is the year of vegan burgers, dairy-free ice cream, and mushroom-based sushi — and which kitchens are leading the charge.',
    cover_image_url: '🌱',
    author_name: 'Priya Sharma',
    author_avatar_url: null,
    category: 'trends',
    reading_time_min: 7,
    published_at: '2026-08-15T15:00:00Z',
    tags: ['vegan', 'trends', 'plant-based'],
    views_count: 7300,
    likes_count: 590,
  },
];

// ----------------------------------------------------------------- LOYALTY TIERS
export const DEMO_LOYALTY_TIERS: LoyaltyTier[] = [
  { id: 1, name: 'Silver Fork',   min_points: 0,     cashback_percent: 2,  icon: 'silverware-fork-knife', color: '#9CA3AF', perks: ['2% cashback on every order', 'Birthday surprise dish'] },
  { id: 2, name: 'Gold Plate',    min_points: 1000,  cashback_percent: 5,  icon: 'gold',                  color: '#FBBF24', perks: ['5% cashback on every order', 'Priority chef queue', 'Free delivery over $15', 'Exclusive Gold-only coupons'] },
  { id: 3, name: 'Platinum Chef', min_points: 5000,  cashback_percent: 10, icon: 'crown',                 color: '#A78BFA', perks: ['10% cashback on every order', 'VIP express delivery', 'Free delivery — no minimum', 'Early access to flash sales', 'Personal chef concierge'] },
];

// ----------------------------------------------------------------- DELIVERY SLOTS
export const DEMO_DELIVERY_SLOTS: DeliverySlot[] = [
  { id: 'asap',     label: 'ASAP · 25–35 min',       date: '2026-09-08', start_time: 'now',     end_time: '+35min', is_available: true,  is_express: true,  extra_charge: 0 },
  { id: 'today-1',  label: 'Today · 12–1 PM',         date: '2026-09-08', start_time: '12:00',   end_time: '13:00',   is_available: true,  is_express: false, extra_charge: 0 },
  { id: 'today-2',  label: 'Today · 1–2 PM',          date: '2026-09-08', start_time: '13:00',   end_time: '14:00',   is_available: true,  is_express: false, extra_charge: 0 },
  { id: 'today-3',  label: 'Today · 2–3 PM',          date: '2026-09-08', start_time: '14:00',   end_time: '15:00',   is_available: false, is_express: false, extra_charge: 0 },
  { id: 'today-4',  label: 'Today · 6–7 PM',          date: '2026-09-08', start_time: '18:00',   end_time: '19:00',   is_available: true,  is_express: false, extra_charge: 0 },
  { id: 'today-5',  label: 'Today · 7–8 PM (Dinner)', date: '2026-09-08', start_time: '19:00',   end_time: '20:00',   is_available: true,  is_express: false, extra_charge: 0 },
  { id: 'tom-1',    label: 'Tomorrow · 12–1 PM',      date: '2026-09-09', start_time: '12:00',   end_time: '13:00',   is_available: true,  is_express: false, extra_charge: 0 },
  { id: 'tom-2',    label: 'Tomorrow · 7–8 PM',       date: '2026-09-09', start_time: '19:00',   end_time: '20:00',   is_available: true,  is_express: false, extra_charge: 0 },
];

// ----------------------------------------------------------------- CASHBACK OFFERS
export const DEMO_CASHBACK_OFFERS: CashbackOffer[] = [
  { id: 1, title: 'Weekend Feast Cashback', description: 'Get 10% cashback on orders above $25 — every Saturday & Sunday', percent: 10, min_order_amount: 25, max_cashback: 15, status: 'active', expires_at: '2026-12-31T23:59:59Z' },
  { id: 2, title: 'First Order Cashback',   description: 'New to FoodHub? Get 15% cashback on your first order',           percent: 15, min_order_amount: 10, max_cashback: 10, status: 'active', expires_at: '2026-12-31T23:59:59Z' },
  { id: 3, title: 'Late Night Cravings',    description: '5% cashback on orders between 11 PM and 2 AM',                    percent: 5,  min_order_amount: 15, max_cashback: 8,  status: 'active', expires_at: '2026-12-31T23:59:59Z' },
];

// ----------------------------------------------------------------- SURGE
export const DEMO_SURGE: SurgeCharge = {
  active: false,
  reason: 'Normal demand',
  amount: 0,
  percent: 0,
};

// ----------------------------------------------------------------- DELIVERY INSTRUCTIONS
export const DELIVERY_INSTRUCTION_OPTIONS = [
  { id: 'leave_at_door',   label: FoodCopy.delivery.leaveAtDoor,        icon: 'door' },
  { id: 'leave_at_recep',  label: FoodCopy.delivery.leaveAtReception,   icon: 'desk' },
  { id: 'avoid_calling',   label: FoodCopy.delivery.avoidCalling,       icon: 'phone-off' },
  { id: 'call_asap',       label: FoodCopy.delivery.callAsap,           icon: 'phone-ring' },
  { id: 'call_if_unavail', label: FoodCopy.delivery.callIfUnavailable,  icon: 'phone-alert' },
  { id: 'ring_bell',       label: FoodCopy.delivery.ringBell,           icon: 'bell-ring' },
  { id: 'no_contact',      label: FoodCopy.delivery.noContact,          icon: 'hand-back-right-off' },
];

// ----------------------------------------------------------------- LOOKUP HELPERS
// Attach nutrition/allergen/ingredient/bulk-tier data to an Item at runtime
// (since the V5.0 demo Item type doesn't ship with these fields populated).
export function attachGroceryFeatures<T extends { id: number }>(item: T): T & {
  nutrition_info?: ItemNutrition;
  allergens?: string[];
  ingredients?: string[];
  bulk_discount_tiers?: BulkDiscountTier[];
} {
  return {
    ...item,
    nutrition_info: DEMO_NUTRITION[item.id],
    allergens: DEMO_ALLERGENS[item.id],
    ingredients: DEMO_INGREDIENTS[item.id],
    bulk_discount_tiers: DEMO_BULK_TIERS,
  };
}
