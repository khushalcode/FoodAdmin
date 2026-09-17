// V4.0 demo data — replaces old demo-data.ts.
// Mock data backing the app's REST calls when the backend is unavailable.
// Uses V4.0 Item/Store/Coupon/etc. types from src/types.


import type { Item, Store, Category, Banner, Module, Coupon, AppNotification, WalletTransaction, LoyaltyTransaction, ParcelCategory, Vehicle, Service, Reel, Brand, Campaign, Address } from '@/types';

const ITEM_IMG = 'https://picsum.photos/seed/';
const BANNER_IMG = 'https://picsum.photos/seed/';

// ---------- Modules ----------
// FoodHub — food only
export const DEMO_MODULES: Module[] = [
  { id: 1, module_type: 'food', module_name: 'Food', description: 'Hot & fresh meals near you', icon: null, thumbnail: null, status: true, theme_color: '#FF6B35' },
];

// ---------- Categories ----------
// FoodHub — food dish categories only
export const DEMO_CATEGORIES: Category[] = [
  { id: 31, name: 'Burgers',   image_url: '../../assets/images/food/burger.jpg',   module_id: 1, position: 1, parent_id: null, priority: 'high',   status: true, item_count: 18, stores_count: 5 },
  { id: 32, name: 'Pizza',     image_url: '../../assets/images/food/pizza.jpg',     module_id: 1, position: 2, parent_id: null, priority: 'high',   status: true, item_count: 24, stores_count: 4 },
  { id: 33, name: 'Sushi',     image_url: '../../assets/images/food/sushi.jpg',     module_id: 1, position: 3, parent_id: null, priority: 'high',   status: true, item_count: 15, stores_count: 3 },
  { id: 34, name: 'Tacos',     image_url: '../../assets/images/food/tacos.jpg',     module_id: 1, position: 4, parent_id: null, priority: 'medium', status: true, item_count: 12, stores_count: 2 },
  { id: 35, name: 'Pasta',     image_url: '../../assets/images/food/pasta.jpg',     module_id: 1, position: 5, parent_id: null, priority: 'medium', status: true, item_count: 14, stores_count: 3 },
  { id: 36, name: 'Salads',    image_url: '../../assets/images/food/salad.jpg',     module_id: 1, position: 6, parent_id: null, priority: 'low',    status: true, item_count: 10, stores_count: 4 },
  { id: 37, name: 'Desserts',  image_url: '../../assets/images/food/dessert.jpg',   module_id: 1, position: 7, parent_id: null, priority: 'medium', status: true, item_count: 16, stores_count: 4 },
  { id: 38, name: 'Beverages', image_url: '../../assets/images/food/beverages.jpg', module_id: 1, position: 8, parent_id: null, priority: 'medium', status: true, item_count: 22, stores_count: 8 },
];

// ---------- Stores (Restaurants) ----------
// FoodHub — food restaurants only (all module_id: 1 = food)
export const DEMO_STORES: Store[] = [
  {
    id: 1, name: 'Burger Junction', module_id: 1, category_id: 31, category_ids: [31, 38],
    logo_url: '../../assets/images/food/restaurant1.jpg', cover_photo_url: '../../assets/images/food/burger.jpg',
    description: 'Juicy burgers & sides, made fresh',
    address: '123 Grill St, Food District', latitude: 37.7749, longitude: -122.4194,
    phone: '+15551234567', email: 'hello@burgerjunction.com', rating: 4.6, rating_count: 412, order_count: 2300,
    is_featured: 1, is_active: true, is_open: true, is_promoted: true, is_verified: true,
    delivery_time_min: 25, delivery_time_max: 35, delivery_fee: 1.99, minimum_order_amount: 8,
    free_delivery: true, distance_km: 2.1, discount_pct: 0.15, discount_amount: 0, discount_type: 'percent',
    coupon_title: '15% OFF', coupon_code: 'BURGER15',
    self_delivery_system: false, zone_id: 1, veg: true, non_veg: true,
  },
  {
    id: 2, name: 'Pizza Palace', module_id: 1, category_id: 32, category_ids: [32, 35],
    logo_url: '../../assets/images/food/restaurant2.jpg', cover_photo_url: '../../assets/images/food/pizza.jpg',
    description: 'Wood-fired pizzas, pasta & Italian classics',
    address: '456 Oven Ave, Little Italy', latitude: 37.7849, longitude: -122.4094,
    phone: '+15552345678', email: 'orders@pizzapalace.com', rating: 4.8, rating_count: 856, order_count: 4200,
    is_featured: 1, is_active: true, is_open: true, is_promoted: true, is_verified: true,
    delivery_time_min: 30, delivery_time_max: 40, delivery_fee: 2.99, minimum_order_amount: 12,
    free_delivery: false, distance_km: 3.5, discount_pct: 0.10, discount_amount: 0, discount_type: 'percent',
    coupon_title: '10% OFF', coupon_code: 'PIZZA10',
    self_delivery_system: false, zone_id: 1, veg: true, non_veg: true,
  },
  {
    id: 3, name: 'Sushi World', module_id: 1, category_id: 33, category_ids: [33, 37],
    logo_url: '../../assets/images/food/restaurant3.jpg', cover_photo_url: '../../assets/images/food/sushi.jpg',
    description: 'Fresh sushi, sashimi & Japanese specialties',
    address: '789 Sakura Blvd, Japantown', latitude: 37.7549, longitude: -122.4094,
    phone: '+15553456789', email: 'hello@sushiworld.com', rating: 4.7, rating_count: 324, order_count: 1800,
    is_featured: 1, is_active: true, is_open: true, is_promoted: false, is_verified: true,
    delivery_time_min: 35, delivery_time_max: 45, delivery_fee: 3.49, minimum_order_amount: 15,
    free_delivery: false, distance_km: 4.2, discount_pct: 0.05, discount_amount: 0, discount_type: 'percent',
    self_delivery_system: false, zone_id: 1, veg: true, non_veg: true,
  },
  {
    id: 4, name: 'Taco Fiesta', module_id: 1, category_id: 34, category_ids: [34, 38],
    logo_url: '../../assets/images/food/restaurant1.jpg', cover_photo_url: '../../assets/images/food/tacos.jpg',
    description: 'Authentic Mexican tacos, burritos & nachos',
    address: '321 Fiesta Rd, Mission District', latitude: 37.7649, longitude: -122.4294,
    phone: '+15554567890', email: 'hola@tacofiesta.com', rating: 4.5, rating_count: 198, order_count: 980,
    is_featured: 0, is_active: true, is_open: true, is_promoted: false, is_verified: true,
    delivery_time_min: 20, delivery_time_max: 30, delivery_fee: 2.49, minimum_order_amount: 7,
    free_delivery: true, distance_km: 2.8, discount_pct: 0.20, discount_amount: 0, discount_type: 'percent',
    coupon_title: '20% OFF', coupon_code: 'TACO20',
    self_delivery_system: false, zone_id: 1, veg: true, non_veg: true,
  },
];

// ---------- Items (Dishes) ----------
// FoodHub — food dishes only
function makeItem(id: number, name: string, storeId: number, storeName: string, moduleId: number, categoryId: number, price: number, originalPrice: number | null, unit: string, opts: Partial<Item> = {}): Item {
  const discount = originalPrice ? Math.round((originalPrice - price) / originalPrice * 100) : 0;
  // Map category to local food image
  const catImages: Record<number, string> = {
    31: '../../assets/images/food/burger.jpg',
    32: '../../assets/images/food/pizza.jpg',
    33: '../../assets/images/food/sushi.jpg',
    34: '../../assets/images/food/tacos.jpg',
    35: '../../assets/images/food/pasta.jpg',
    36: '../../assets/images/food/salad.jpg',
    37: '../../assets/images/food/dessert.jpg',
    38: '../../assets/images/food/beverages.jpg',
  };
  return {
    id,
    name,
    description: opts.description ?? `${name} - freshly made and delivered hot.`,
    image_url: [catImages[categoryId] || '../../assets/images/food/burger.jpg'],
    category_id: categoryId,
    category_ids: [categoryId],
    module_id: moduleId,
    unit_type: unit,
    unit,
    price,
    discount: discount,
    discount_type: 'percent',
    store_id: storeId,
    store_name: storeName,
    rating: opts.rating ?? 4.5,
    rating_count: opts.rating_count ?? 120,
    order_count: opts.order_count ?? 350,
    is_featured: opts.is_featured ?? 1,
    is_popular: opts.is_popular ?? 1,
    is_recommended: opts.is_recommended ?? 0,
    is_organic: opts.is_organic ?? false,
    is_halal: opts.is_halal ?? false,
    is_veg: opts.is_veg ?? true,
    is_non_veg: opts.is_non_veg ?? false,
    add_ons: [],
    variations: [],
    stock: opts.stock ?? 100,
    tax: 5,
    tax_type: 'include',
    status: true,
  };
}

export const DEMO_ITEMS: Item[] = [
  // Burger Junction
  makeItem(1, 'Classic Cheeseburger',  1, 'Burger Junction', 1, 31, 6.99, null,  '1 pc',  { rating: 4.7, rating_count: 540, is_featured: 1, is_popular: 1, is_veg: false, is_non_veg: true, description: 'Beef patty, cheddar, lettuce, tomato, house sauce' }),
  makeItem(2, 'Double Bacon Burger',   1, 'Burger Junction', 1, 31, 9.99, 11.99, '1 pc',  { rating: 4.9, rating_count: 380, is_veg: false, is_non_veg: true, is_halal: true, description: 'Two patties, bacon, double cheese' }),
  makeItem(3, 'Veggie Burger',         1, 'Burger Junction', 1, 31, 5.99, null,  '1 pc',  { rating: 4.4, rating_count: 120, is_veg: true, is_non_veg: false, description: 'Plant-based patty, avocado, sprouts' }),
  makeItem(4, 'Chicken Burger',        1, 'Burger Junction', 1, 31, 7.49, null,  '1 pc',  { rating: 4.6, rating_count: 200, is_veg: false, is_non_veg: true, description: 'Grilled chicken breast, mayo, lettuce' }),
  makeItem(5, 'French Fries (L)',      1, 'Burger Junction', 1, 38, 2.99, null,  'Large', { rating: 4.3, rating_count: 500, is_veg: true, is_popular: 1, description: 'Crispy golden fries with sea salt' }),
  makeItem(6, 'Caesar Salad',          1, 'Burger Junction', 1, 36, 4.99, null,  'Bowl',  { rating: 4.3, rating_count: 180, is_veg: true, description: 'Romaine, croutons, parmesan, caesar dressing' }),
  makeItem(7, 'Coca-Cola 330ml',       1, 'Burger Junction', 1, 38, 1.20, null,  '1 can', { rating: 4.0, rating_count: 600, is_veg: true, is_popular: 1, description: 'Chilled Coca-Cola' }),

  // Pizza Palace
  makeItem(10, 'Margherita Pizza',     2, 'Pizza Palace', 1, 32, 8.99, null,  '12"',   { rating: 4.8, rating_count: 1200, is_featured: 1, is_popular: 1, is_veg: true, description: 'Tomato, mozzarella, fresh basil' }),
  makeItem(11, 'Pepperoni Pizza',      2, 'Pizza Palace', 1, 32, 10.99, 12.99, '12"',  { rating: 4.7, rating_count: 950, is_veg: false, is_non_veg: true, is_halal: true, description: 'Loaded with pepperoni' }),
  makeItem(12, 'BBQ Chicken Pizza',    2, 'Pizza Palace', 1, 32, 11.99, null, '12"',  { rating: 4.6, rating_count: 600, is_veg: false, is_non_veg: true, description: 'BBQ sauce, grilled chicken, red onions' }),
  makeItem(13, 'Veggie Supreme Pizza', 2, 'Pizza Palace', 1, 32, 9.99, null,  '12"',   { rating: 4.5, rating_count: 500, is_veg: true, description: 'Peppers, mushrooms, olives, onions' }),
  makeItem(14, 'Garlic Bread',         2, 'Pizza Palace', 1, 32, 3.99, null,  '4 pcs', { rating: 4.4, rating_count: 800, is_veg: true, is_popular: 1, description: 'Cheesy garlic breadsticks' }),
  makeItem(15, 'Spaghetti Carbonara',  2, 'Pizza Palace', 1, 35, 7.49, null,  'Plate', { rating: 4.5, rating_count: 350, is_veg: false, is_non_veg: true, description: 'Pancetta, egg, parmesan' }),
  makeItem(16, 'Chocolate Lava Cake',  2, 'Pizza Palace', 1, 37, 4.49, null,  '1 pc',  { rating: 4.7, rating_count: 480, is_veg: true, is_featured: 1, is_popular: 1, description: 'Molten chocolate cake with vanilla ice cream' }),
  makeItem(17, 'Iced Coffee',          2, 'Pizza Palace', 1, 38, 2.99, null,  '400ml', { rating: 4.5, rating_count: 700, is_veg: true, is_popular: 1, description: 'Cold brew with milk and ice' }),

  // Sushi World
  makeItem(20, 'California Roll',     3, 'Sushi World', 1, 33, 7.99, null,  '8 pcs', { rating: 4.6, rating_count: 550, is_featured: 1, is_popular: 1, is_veg: false, is_non_veg: true, description: 'Crab, avocado, cucumber, nori' }),
  makeItem(21, 'Salmon Nigiri',       3, 'Sushi World', 1, 33, 9.49, null,  '6 pcs', { rating: 4.8, rating_count: 420, is_veg: false, is_non_veg: true, description: 'Fresh salmon over rice' }),
  makeItem(22, 'Tuna Roll',           3, 'Sushi World', 1, 33, 8.49, null,  '8 pcs', { rating: 4.5, rating_count: 380, is_veg: false, is_non_veg: true, description: 'Fresh tuna, rice, nori' }),
  makeItem(23, 'Vegetable Tempura',   3, 'Sushi World', 1, 33, 5.99, null,  '8 pcs', { rating: 4.3, rating_count: 300, is_veg: true, description: 'Crispy battered vegetables' }),
  makeItem(24, 'Miso Soup',           3, 'Sushi World', 1, 38, 2.49, null,  'Bowl',  { rating: 4.2, rating_count: 650, is_veg: true, description: 'Traditional soybean paste soup with tofu' }),
  makeItem(25, 'Tiramisu',            3, 'Sushi World', 1, 37, 4.99, 5.99, '1 pc',  { rating: 4.6, rating_count: 320, is_veg: true, is_featured: 1, description: 'Italian coffee-flavored dessert' }),

  // Taco Fiesta
  makeItem(30, 'Beef Tacos (3 pcs)',  4, 'Taco Fiesta', 1, 34, 5.99, null,  '3 pcs', { rating: 4.4, rating_count: 500, is_featured: 1, is_popular: 1, is_veg: false, is_non_veg: true, is_halal: true, description: 'Soft tortillas, seasoned beef, salsa, lime' }),
  makeItem(31, 'Chicken Tacos (3 pcs)',4, 'Taco Fiesta', 1, 34, 5.49, null,  '3 pcs', { rating: 4.3, rating_count: 450, is_veg: false, is_non_veg: true, description: 'Grilled chicken, lettuce, cheese, salsa' }),
  makeItem(32, 'Veggie Tacos (3 pcs)', 4, 'Taco Fiesta', 1, 34, 4.99, null,  '3 pcs', { rating: 4.2, rating_count: 280, is_veg: true, is_non_veg: false, description: 'Black beans, avocado, salsa, cilantro' }),
  makeItem(33, 'Nachos Supreme',      4, 'Taco Fiesta', 1, 34, 4.49, null,  'Plate', { rating: 4.1, rating_count: 550, is_veg: true, is_popular: 1, description: 'Tortilla chips, cheese, jalapenos, salsa' }),
  makeItem(34, 'Fresh Orange Juice',  4, 'Taco Fiesta', 1, 38, 2.50, null,  '400ml', { rating: 4.6, rating_count: 550, is_veg: true, is_popular: 1, description: '100% pure juice, no sugar added' }),
];

// ---------- Banners ----------
// FoodHub — food delivery banners
export const DEMO_BANNERS: Banner[] = [
  { id: 1, title: 'Free Delivery on First Order', image_url: '../../assets/images/food/banner1.jpg', type: 'app', module_id: 1, data: null, store_id: 1, item_id: null, category_id: null, background_color: '#FF6B35' },
  { id: 2, title: '20% Off All Pizzas This Week', image_url: '../../assets/images/food/pizza.jpg', type: 'app', module_id: 1, data: null, store_id: 2, item_id: null, category_id: null, background_color: '#C7283F' },
  { id: 3, title: 'New Restaurants Now Open', image_url: '../../assets/images/food/restaurant1.jpg', type: 'app', module_id: 1, data: null, store_id: null, item_id: null, category_id: null, background_color: '#FF6B35' },
  { id: 4, title: 'Flash Sale - Up to 50% Off Food', image_url: '../../assets/images/food/dessert.jpg', type: 'app', module_id: 1, data: null, store_id: null, item_id: null, category_id: null, background_color: '#C7283F' },
];

// ---------- Coupons ----------
export const DEMO_COUPONS: Coupon[] = [
  { id: 1, title: '20% Off First Order', code: 'WELCOME20', description: 'Get 20% off on your first order. Max discount $50.', module_id: 0, coupon_type: 'first_order', min_purchase: 30, max_discount: 50, discount: 20, discount_type: 'percent', store_id: null, category_id: null, item_id: null, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), is_expired: false, used_count: 0, total_use_count: 1000, image_url: null },
  { id: 2, title: 'Flat $5 Off', code: 'SAVE5', description: 'Flat $5 off on orders above $25.', module_id: 0, coupon_type: 'default', min_purchase: 25, max_discount: 5, discount: 5, discount_type: 'amount', store_id: null, category_id: null, item_id: null, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), is_expired: false, used_count: 12, total_use_count: 500, image_url: null },
  { id: 3, title: 'Free Delivery', code: 'FREEDEL', description: 'Free delivery on orders above $20.', module_id: 0, coupon_type: 'default', min_purchase: 20, max_discount: 10, discount: 5, discount_type: 'amount', store_id: null, category_id: null, item_id: null, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), is_expired: false, used_count: 5, total_use_count: 200, image_url: null },
  { id: 4, title: '15% Off Grocery', code: 'GROCERY15', description: '15% off on grocery items. Max discount $30.', module_id: 1, coupon_type: 'category_base', min_purchase: 50, max_discount: 30, discount: 15, discount_type: 'percent', store_id: null, category_id: 1, item_id: null, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), is_expired: false, used_count: 0, total_use_count: 1000, image_url: null },
  { id: 5, title: 'Fresh Foods $10 Off', code: 'FRESH10', description: '$10 off on orders from Fresh Foods Store above $40.', module_id: 0, coupon_type: 'store_base', min_purchase: 40, max_discount: 10, discount: 10, discount_type: 'amount', store_id: 1, store_name: 'Fresh Foods Store', category_id: null, item_id: null, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), is_expired: false, used_count: 0, total_use_count: 100, image_url: null },
];

// ---------- Notifications ----------
export const DEMO_NOTIFICATIONS: AppNotification[] = [
  { id: 1, title: 'Order Confirmed', body: 'Your order #ORD-001 has been confirmed by the store.', type: 'order', is_read: false, created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { id: 2, title: 'Flash Sale Live Now!', body: 'Up to 50% off on grocery items. Limited time only.', type: 'promotion', is_read: false, image_url: 'assets/images/flutter/flash_sell_bg.png', created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
  { id: 3, title: 'New Coupon Available', body: 'Use code WELCOME20 for 20% off your next order.', type: 'coupon', is_read: true, created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: 4, title: 'Order Delivered', body: 'Your order #ORD-000 was delivered. Rate your experience!', type: 'order', is_read: true, created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
];

// ---------- Wallet ----------
export const DEMO_WALLET_TX: WalletTransaction[] = [
  { id: 1, user_id: '', type: 'credit', amount: 100, reference: 'TOPUP-001', description: 'Wallet top-up via Card', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 2, user_id: '', type: 'debit', amount: 35.50, reference: 'ORD-001', description: 'Order #ORD-001 payment', order_id: 1, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 3, user_id: '', type: 'credit', amount: 25, reference: 'LOYALTY-001', description: 'Converted 250 loyalty points', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 4, user_id: '', type: 'debit', amount: 12.99, reference: 'ORD-002', description: 'Order #ORD-002 payment', order_id: 2, created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 5, user_id: '', type: 'credit', amount: 50, reference: 'REFUND-001', description: 'Refund for cancelled order #ORD-003', order_id: 3, created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];

// ---------- Loyalty ----------
export const DEMO_LOYALTY_TX: LoyaltyTransaction[] = [
  { id: 1, user_id: '', type: 'credit', points: 50, reference: 'ORD-001', description: 'Earned from order #ORD-001', amount: 0.5, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 2, user_id: '', type: 'credit', points: 35, reference: 'ORD-002', description: 'Earned from order #ORD-002', amount: 0.35, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 3, user_id: '', type: 'debit', points: 250, reference: 'CONV-001', description: 'Converted to wallet ($2.50)', amount: 2.5, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 4, user_id: '', type: 'credit', points: 100, reference: 'BONUS-001', description: 'Welcome bonus', amount: 1, created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
];

// ---------- Parcel ----------
export const DEMO_PARCEL_CATEGORIES: ParcelCategory[] = [
  { id: 1, name: 'Documents', image_url: 'assets/images/flutter/docs_icon.png', description: 'Letters, certificates, books', base_price: 3.99 },
  { id: 2, name: 'Clothing', image_url: 'assets/images/flutter/biking.png', description: 'Shirts, dresses, accessories', base_price: 4.99 },
  { id: 3, name: 'Electronics', image_url: 'assets/images/flutter/dm_icon.png', description: 'Phones, laptops, gadgets', base_price: 6.99 },
  { id: 4, name: 'Food', image_url: 'assets/images/flutter/delivery_man_icon.png', description: 'Packed meals, groceries', base_price: 5.49 },
  { id: 5, name: 'Other', image_url: 'assets/images/flutter/parcel.png', description: 'Anything else', base_price: 7.99 },
];

// ---------- Vehicles (Rental + Ride-share) ----------
export const DEMO_VEHICLES: Vehicle[] = [
  { id: 1, name: 'City Bike', brand: 'Honda', model: 'CBR 250', type: 'bike', image_url: 'assets/images/flutter/biking.png', base_price: 1.50, per_km_price: 0.40, minimum_price: 3.00, rating: 4.7, rating_count: 120, is_top_rated: true, seats: 1, ac: false, description: 'Quick and agile city bike' },
  { id: 2, name: 'Sedan Car', brand: 'Toyota', model: 'Camry', type: 'car', image_url: 'assets/images/flutter/car_side.png', base_price: 5.00, per_km_price: 1.20, minimum_price: 10.00, rating: 4.8, rating_count: 540, is_top_rated: true, seats: 4, ac: true, description: 'Comfortable sedan with AC' },
  { id: 3, name: 'Auto Rickshaw', brand: 'Bajaj', model: 'RE', type: 'auto', image_url: 'assets/images/flutter/auto.png', base_price: 2.00, per_km_price: 0.60, minimum_price: 4.00, rating: 4.4, rating_count: 210, is_top_rated: false, seats: 3, ac: false, description: 'Three-wheeler auto' },
  { id: 4, name: 'SUV', brand: 'Hyundai', model: 'Creta', type: 'car', image_url: 'assets/images/flutter/car_delivery.png', base_price: 7.00, per_km_price: 1.80, minimum_price: 15.00, rating: 4.9, rating_count: 320, is_top_rated: true, seats: 6, ac: true, description: 'Spacious SUV for groups' },
];

// ---------- Services ----------
export const DEMO_SERVICES: Service[] = [
  { id: 1, name: 'Home Cleaning', category: 'Cleaning', description: 'Deep cleaning for your home', image_url: 'assets/images/flutter/cleaning.png', base_price: 49.99, duration_min: 180, rating: 4.7, rating_count: 320, is_featured: true },
  { id: 2, name: 'AC Service & Repair', category: 'Repair', description: 'AC installation and repair', image_url: 'assets/images/flutter/ac.png', base_price: 39.99, duration_min: 90, rating: 4.6, rating_count: 145, is_featured: true },
  { id: 3, name: 'Plumbing Service', category: 'Repair', description: 'Plumbing repair & installation', image_url: 'assets/images/flutter/biking.png', base_price: 29.99, duration_min: 60, rating: 4.5, rating_count: 88, is_featured: false },
  { id: 4, name: 'Electrician On Call', category: 'Repair', description: 'Electrical repair & wiring', image_url: 'assets/images/flutter/dm_icon.png', base_price: 34.99, duration_min: 60, rating: 4.8, rating_count: 210, is_featured: true },
  { id: 5, name: 'Salon at Home', category: 'Beauty', description: 'Haircut, shave, facial at home', image_url: 'assets/images/flutter/delivery.png', base_price: 25.99, duration_min: 60, rating: 4.6, rating_count: 175, is_featured: false },
];

// ---------- Reels ----------
export const DEMO_REELS: Reel[] = [
  { id: 1, title: 'Flash sale on chocolates!', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnail_url: ITEM_IMG + 'Reel1', item_id: 1, store_id: 1, views_count: 1230, likes_count: 234, comments_count: 12, is_liked: false, created_at: new Date().toISOString() },
  { id: 2, title: 'Fresh veggies straight from farm', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnail_url: ITEM_IMG + 'Reel2', item_id: 6, store_id: 1, views_count: 890, likes_count: 145, comments_count: 8, is_liked: true, created_at: new Date().toISOString() },
  { id: 3, title: 'Best burger in town', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnail_url: ITEM_IMG + 'Reel3', item_id: 60, store_id: 4, views_count: 2100, likes_count: 540, comments_count: 42, is_liked: false, created_at: new Date().toISOString() },
];

// ---------- Brands ----------
export const DEMO_BRANDS: Brand[] = [
  { id: 1, name: 'Ferrero', image_url: ITEM_IMG + 'Ferrero', item_count: 12, store_count: 5, is_featured: true },
  { id: 2, name: 'Barilla', image_url: ITEM_IMG + 'Barilla', item_count: 18, store_count: 8, is_featured: true },
  { id: 3, name: 'Praise', image_url: ITEM_IMG + 'Praise', item_count: 6, store_count: 4, is_featured: false },
  { id: 4, name: 'Olive Oil Co.', image_url: ITEM_IMG + 'Olive', item_count: 9, store_count: 3, is_featured: true },
];

// ---------- Campaigns ----------
export const DEMO_CAMPAIGNS: Campaign[] = [
  { id: 1, title: 'Summer Sale', description: 'Beat the heat with cool discounts', image_url: BANNER_IMG + 'Summer', type: 'basic', start_date: new Date().toISOString(), end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), is_active: true, status: 'ongoing' },
  { id: 2, title: 'Back to School', description: 'School supplies & snacks', image_url: BANNER_IMG + 'School', type: 'basic', start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), is_active: true, status: 'upcoming' },
];

// ---------- Addresses ----------
export const DEMO_ADDRESSES: Address[] = [
  {
    id: 1, user_id: 'demo', label: 'Home', contact_person_name: 'John Doe', contact_person_number: '+15551234567',
    address: 'Apartment 4B, 123 Main Street, Springfield', address_type: 'home',
    road: 'Main Street', house: '4B', floor: '2nd', city: 'Springfield', state: 'CA', pincode: '90210',
    latitude: 37.7749, longitude: -122.4194, is_default: true, is_billing: false, zone_id: 1,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 2, user_id: 'demo', label: 'Work', contact_person_name: 'John Doe', contact_person_number: '+15551234567',
    address: 'Suite 200, 456 Business Ave, Riverton', address_type: 'work',
    road: 'Business Ave', house: '200', floor: '5th', city: 'Riverton', state: 'CA', pincode: '90211',
    latitude: 37.7849, longitude: -122.4094, is_default: false, is_billing: false, zone_id: 1,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
];

// Backwards-compat aliases for any code still referencing old names.
export const DEMO_VENDORS = DEMO_STORES;
export const DEMO_PRODUCTS = DEMO_ITEMS;
