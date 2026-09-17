// TypeScript types matching the FoodHub V4.0 data model (Flutter lib/features/*/domain/models/*).
// Mirrors Flutter's model classes — kept framework-agnostic so the same types
// work whether we hit the REST backend, Supabase, or local mock data.

export type CategoryKey = 'home' | 'grocery' | 'pharmacy' | 'shop' | 'food' | 'parcel' | 'rental' | 'service' | 'ride_share';

// ---------- Auth ----------
export type AuthMethod = 'password' | 'otp' | 'guest' | 'google' | 'facebook' | 'apple';

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  image_url: string | null;
  is_guest: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  loyalty_points: number;
  wallet_balance: number;
  order_count: number;
  member_since: string | null;
  refer_code: string | null;
  gender?: 'male' | 'female' | 'other';
  date_of_birth?: string | null;
  country_code?: string;
  zone_id?: number;
  city?: string | null;
  address?: string | null;
}

export interface AppSession {
  user: User | null;
  method: AuthMethod | null;
  token: string | null;
}

// ---------- Configuration ----------
export interface AppConfig {
  business_name: string;
  logo_url: string;
  address: string;
  phone: string;
  email: string;
  currency_symbol: string;
  currency_symbol_position: 'left' | 'right';
  currency_decimal_point: number;
  base_urls: { product_image_url: string; store_image_url: string; category_image_url: string; banner_image_url: string; customer_image_url: string; vendor_image_url: string; review_image_url: string; campaign_image_url: string };
  country: string;
  sos_active: boolean;
  maintenance_mode: boolean;
  default_location: { lat: number; lng: number };
  free_delivery_over_amount?: number;
  bulk_order_discount?: { amount: number; percent: number } | null;
  loyalty_point_exchange_rate: number;
  loyalty_point_min_exchange_amount: number;
  dm_tips_status: boolean;
  order_delivery_verification: boolean;
  module_config: Record<string, any>;
}

// ---------- Category ----------
export interface Category {
  id: number;
  name: string;
  image_url: string | null;
  module_id: number;
  position: number;
  parent_id: number | null;
  priority: 'low' | 'medium' | 'high';
  status: boolean;
  item_count?: number;
  stores_count?: number;
  childes?: Category[];
}

// ---------- Module ----------
export interface Module {
  id: number;
  module_type: string; // grocery, pharmacy, shop, food, parcel, rental, ride_share, service
  module_name: string;
  description: string;
  icon: string | null;
  thumbnail: string | null;
  status: boolean;
  theme_color: string | null;
}

// ---------- Banner ----------
export type BannerType = 'web' | 'app' | 'store_wise' | 'item_wise' | 'taxi';

export interface Banner {
  id: number;
  title: string;
  image_url: string;
  type: BannerType;
  module_id: number;
  data: string | null;
  store_id: number | null;
  item_id: number | null;
  category_id: number | null;
  background_color: string | null;
  redirect_link?: string | null;
}

export interface SmartBanner {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  icon: string | null;
  redirect_link: string | null;
}

// ---------- Item (Product) ----------
export interface ItemVariation {
  type: string;
  label: string;
  options: { label: string; optionPrice: number }[];
}

export interface ItemAddOn {
  id: number;
  name: string;
  price: number;
  status: boolean;
}

// ============================================================================
// NEW — Grocery-ported food feature types (V5.1)
// ============================================================================

// Per-serving nutrition facts — ported from BlinkSyGold grocery items
export interface ItemNutrition {
  calories: number;          // kcal per serving
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  serving_size?: string;     // e.g., "1 plate (250g)"
  servings_per_container?: number;
}

// Bulk discount tier — qty-based automatic savings (grocery pattern)
export interface BulkDiscountTier {
  min_qty: number;           // minimum quantity to unlock
  percent: number;           // 5, 10, 15, 20
  label?: string;            // optional display label
}

// Restock alert — user opts-in to be notified when an out-of-stock dish returns
export interface RestockAlert {
  id: number;
  user_id: string;
  item_id: number;
  item_name?: string;
  store_id: number;
  store_name?: string;
  status: 'waiting' | 'notified' | 'expired' | 'cancelled';
  created_at: string;
  notified_at?: string | null;
  expires_at?: string | null;
}

// Item subscription — weekly recurring meal delivery (grocery subscription model)
export interface ItemSubscription {
  id: number;
  user_id: string;
  item_id: number;
  item_name?: string;
  store_id: number;
  store_name?: string;
  quantity: number;
  frequency_days: number;       // 7 = weekly, 14 = biweekly, 30 = monthly
  next_delivery_at: string;
  total_deliveries: number;
  completed_deliveries: number;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  discount_percent: number;     // 15% off for subscribers
  created_at: string;
}

// Blog post — food journal articles (grocery feature, repurposed for food)
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body?: string;
  cover_image_url: string;
  author_name: string;
  author_avatar_url?: string | null;
  category: 'recipes' | 'chef_stories' | 'food_guides' | 'trends' | 'news';
  reading_time_min: number;
  published_at: string;
  tags?: string[];
  views_count?: number;
  likes_count?: number;
}

// Brand — restaurant chains / F&B brands (grocery feature, repurposed for food)
export interface FoodBrand {
  id: number;
  name: string;
  slug: string;
  logo_url: string;
  cover_image_url?: string | null;
  description?: string | null;
  item_count: number;
  store_count: number;
  is_featured: boolean;
  is_verified: boolean;
  cuisine_types?: string[];
}

// Flash sale — time-boxed deals (grocery flash sale pattern, food-focused)
export interface FoodFlashSale {
  id: number;
  title: string;
  subtitle?: string;
  image_url?: string | null;
  start_date: string;
  end_date: string;
  discount_percent: number;
  items: Item[];
  total_stock: number;
  sold_count: number;
  is_active: boolean;
}

// Loyalty tier — ported from grocery loyalty with cashback conversion
export interface LoyaltyTier {
  id: number;
  name: string;              // 'Silver Fork', 'Gold Plate', 'Platinum Chef'
  min_points: number;
  cashback_percent: number;  // 2%, 5%, 10%
  perks: string[];
  icon: string;
  color: string;
}

// Scheduled order slot (grocery delivery slot pattern)
export interface DeliverySlot {
  id: string;
  label: string;             // 'Today · 12–1 PM'
  date: string;              // ISO date
  start_time: string;        // '12:00'
  end_time: string;          // '13:00'
  is_available: boolean;
  is_express: boolean;       // true for <30 min slots
  extra_charge?: number;
}

// Delivery instruction option (grocery pattern)
export interface DeliveryInstruction {
  id: string;
  label: string;
  icon: string;              // MaterialCommunityIcons name
  selected: boolean;
}

// Cashback offer on order (grocery cashback feature)
export interface CashbackOffer {
  id: number;
  title: string;
  description: string;
  percent: number;
  min_order_amount: number;
  max_cashback: number;
  status: 'active' | 'expired' | 'upcoming';
  expires_at: string;
}

// Bad weather / surge surcharge (grocery pattern)
export interface SurgeCharge {
  active: boolean;
  reason: string;            // 'High demand', 'Bad weather', 'Festival rush'
  amount: number;
  percent?: number;
}

export interface Item {
  id: number;
  name: string;
  description: string | null;
  image_url: string[] | string;
  category_id: number;
  category_ids: number[];
  module_id: number;
  unit_type: string;
  unit: string;
  price: number;
  discount: number;
  discount_type: 'amount' | 'percent';
  available_time?: string[];
  store_id: number;
  store_name?: string;
  store_image_url?: string | null;
  rating: number;
  rating_count: number;
  order_count: number;
  is_featured: number; // 0, 1
  is_popular: number;
  is_recommended: number;
  is_organic?: boolean;
  is_halal?: boolean;
  is_veg?: boolean;
  is_non_veg?: boolean;
  is_gluten_free?: boolean;             // NEW — grocery-ported dietary tag
  is_spicy?: boolean;                    // NEW — spice level indicator
  is_chef_special?: boolean;             // NEW — chef-curated badge
  is_best_seller?: boolean;              // NEW — top-ordered dish badge
  is_new?: boolean;                      // NEW — recently added to menu
  allergens?: string[];                  // NEW — e.g. ['peanuts','gluten','dairy','shellfish','soy','eggs']
  ingredients?: string[];                // NEW — full ingredient list
  nutrition_info?: ItemNutrition;        // NEW — per-serving nutrition facts
  bulk_discount_tiers?: BulkDiscountTier[]; // NEW — qty-based discount ladder
  subscription_eligible?: boolean;       // NEW — can be set up as weekly subscription
  restock_enabled?: boolean;             // NEW — user can opt-in to restock alerts
  images_url_full_path?: string[];
  add_ons: ItemAddOn[];
  variations: ItemVariation[];
  stock: number;
  tax: number;
  tax_type: 'include' | 'exclude';
  status: boolean;
  tags?: string[];
  nutritions?: string[];
  related_items?: Item[];
  reviews?: Review[];
  // ----- Legacy fields (used by old screens; populated by demo data / mapping) -----
  vendor_id?: number;        // alias for store_id
  original_price?: number | null;  // computed from discount
  discount_pct?: number;     // 0..1 (alias for discount/100 when discount_type=percent)
  subcategory?: string | null;
  category?: CategoryKey;    // module-name alias (grocery/pharmacy/shop/food/parcel)
  image_url_legacy?: string | null;
}

// ---------- Store (Vendor) ----------
export interface Store {
  id: number;
  name: string;
  slug?: string;
  module_id: number;
  module_name?: string;
  category_id: number;
  category_ids: number[];
  logo_url: string | null;
  cover_photo_url: string | null;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  rating: number;
  rating_count: number;
  order_count: number;
  is_featured: number;
  is_active: boolean;
  is_open: boolean;
  is_promoted: boolean;
  is_verified: boolean;
  is_subscribed?: boolean;
  is_subscribed_expired?: boolean;
  schedules?: StoreSchedule[];
  // ----- NEW V5.1: Grocery-ported store/kitchen features -----
  bulk_order_discount?: { amount: number; percent: number } | null;  // unlock at $X
  free_delivery_over_amount?: number;          // min subtotal for free delivery
  cashback_offer?: CashbackOffer | null;        // active cashback campaign
  loyalty_earn_rate?: number;                   // points earned per $1 spent
  subscription_enabled?: boolean;               // kitchen offers subscription meals
  is_express?: boolean;                         // <30 min delivery badge
  is_top_rated?: boolean;                       // 4.5★+ badge
  is_open_now_24h?: boolean;                    // 24/7 kitchen
  promotions?: { title: string; description: string; image_url?: string | null }[];
  delivery_time_min: number;
  delivery_time_max: number;
  delivery_fee?: number;
  minimum_order_amount: number;
  minimum_shipping_charge_per_km?: number;
  free_delivery?: boolean;
  open_status_text?: string;
  distance_km: number;
  discount_pct: number;
  discount_amount: number;
  discount_type: 'amount' | 'percent';
  coupon_title?: string;
  coupon_code?: string;
  veg?: boolean;
  non_veg?: boolean;
  self_delivery_system: boolean;
  zone_id: number;
  tags?: string[];
  reviews?: Review[];
  // ----- Legacy fields (do not duplicate slug / is_promoted — already declared above) -----
  category?: CategoryKey;        // module-name alias
  tagline?: string;              // alias for description
  verified?: boolean;            // alias for is_verified
  created_at?: string;           // when store joined platform (used for "New on Mart" sorting)
  item_count?: number;
}

export interface StoreSchedule {
  day: string;
  opening_time: string;
  closing_time: string;
}

// ---------- Cart ----------
export interface CartItem {
  id: string; // unique cart id within app
  product_id: number;
  product: Item;
  store_id: number;
  store_name: string;
  variation_key?: string;
  variation_label?: string;
  variation_price?: number;
  add_on_ids: number[];
  add_on_names: string[];
  add_on_price: number;
  quantity: number;
  unit_price: number; // base or variation price
  total_price: number; // (unit_price + add_ons) * qty
  discount_amount: number;
  tax_amount: number;
  note?: string;
}

export interface CartGroup {
  store_id: number;
  store_name: string;
  store_logo?: string | null;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
}

// ---------- Address ----------
export interface Address {
  id: number;
  user_id: string;
  label: string;          // Home, Work, Other
  contact_person_name: string;
  contact_person_number: string;
  address: string;
  address_type: 'home' | 'work' | 'delivery';
  road: string;
  house: string;
  floor: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
  is_billing: boolean;
  zone_id: number;
  plus_code?: string;
  created_at: string;
  updated_at: string;
}

// ---------- Order ----------
export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'failed'
  | 'canceled';

export type PaymentMethod = 'cod' | 'card' | 'wallet' | 'digital' | 'online' | 'partial';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial';

export interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  image_url: string | null;
  price: number;
  variation_label?: string;
  variation_price?: number;
  add_on_names: string[];
  add_on_price: number;
  quantity: number;
  total: number;
  tax_amount: number;
  discount_amount: number;
}

export interface Order {
  id: number;
  order_code: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  store_id: number;
  store_name: string;
  store_logo_url: string | null;
  module_id: number;
  module_name?: string;
  items: OrderItem[];
  item_count: number;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  coupon_discount: number;
  coupon_code?: string;
  tax_amount: number;
  dm_tips: number;
  additional_charge: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  order_type: 'delivery' | 'take_away' | 'parcel';
  delivery_address: string | null;
  delivery_address_obj?: Address | null;
  delivery_man_id?: number | null;
  delivery_man_name?: string;
  delivery_man_phone?: string;
  delivery_man_image?: string;
  estimated_delivery_time: string;
  estimated_delivery_at: string;
  scheduled_at?: string | null;
  created_at: string;
  updated_at: string;
  cancel_reason?: string | null;
  track_id?: number;
  is_rated?: boolean;
  is_item_rated?: boolean;
  is_reviewed?: boolean;
  // ----- Legacy fields -----
  status?: OrderStatus;          // alias for order_status
  vendor_name?: string;          // alias for store_name
  vendor_id?: number;            // alias for store_id
}

export interface OrderStatusTimeline {
  status: OrderStatus;
  label: string;
  icon: string; // MaterialCommunityIcons name
  completed: boolean;
  timestamp?: string;
}

// ---------- Coupon ----------
export interface Coupon {
  id: number;
  title: string;
  code: string;
  description: string;
  module_id: number;
  coupon_type: 'default' | 'store_base' | 'first_order' | 'category_base' | 'item_wise';
  min_purchase: number;
  max_discount: number;
  discount: number;
  discount_type: 'amount' | 'percent';
  store_id: number | null;
  store_name?: string;
  category_id: number | null;
  item_id: number | null;
  start_date: string;
  end_date: string;
  is_expired: boolean;
  used_count: number;
  total_use_count: number;
  data?: string;
  image_url?: string | null;
}

// ---------- Favorites ----------
export interface FavoriteItem {
  id: number;
  user_id: string;
  item_id: number;
  store_id: number | null;
  item?: Item;
  store?: Store;
  is_item: boolean;
  created_at: string;
}

// ---------- Notifications ----------
export type NotificationType = 'order' | 'promotion' | 'general' | 'coupon' | 'message';

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  image_url?: string | null;
  is_read: boolean;
  created_at: string;
}

// ---------- Wallet ----------
export type WalletTransactionType = 'debit' | 'credit';

export interface WalletTransaction {
  id: number;
  user_id: string;
  type: WalletTransactionType;
  amount: number;
  reference: string;
  description: string;
  order_id?: number | null;
  created_at: string;
}

// ---------- Loyalty ----------
export type LoyaltyTransactionType = 'debit' | 'credit';

export interface LoyaltyTransaction {
  id: number;
  user_id: string;
  type: LoyaltyTransactionType;
  points: number;
  reference: string;
  description: string;
  amount?: number;
  created_at: string;
}

// ---------- Refer & Earn ----------
export interface ReferralStat {
  total_referrals: number;
  total_earned: number;
  pending_earnings: number;
}

export interface ReferralUser {
  id: string;
  name: string;
  phone: string;
  joined_at: string;
  status: 'pending' | 'completed';
  earned_amount: number;
}

// ---------- Flash Sale ----------
export interface FlashSale {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  items: Item[];
  image_url?: string | null;
}

// ---------- Reviews ----------
export interface Review {
  id: number;
  item_id?: number;
  store_id?: number;
  delivery_man_id?: number;
  user_id: string;
  user_name: string;
  user_image_url?: string | null;
  rating: number;
  comment: string;
  attachment_urls?: string[];
  created_at: string;
  is_helpful?: boolean;
}

// ---------- Chat ----------
export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_type: 'user' | 'vendor' | 'admin' | 'delivery_man' | 'bot';
  sender_id: string;
  sender_name?: string;
  sender_image_url?: string;
  message: string;
  attachment_url?: string | null;
  is_seen: boolean;
  created_at: string;
}

export interface ChatConversation {
  id: number;
  type: 'vendor' | 'admin' | 'delivery_man' | 'ai_bot';
  reference_id: number | null; // vendor_id, order_id, etc.
  name: string;
  image_url?: string | null;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  is_online?: boolean;
}

// ---------- Parcel ----------
export interface ParcelCategory {
  id: number;
  name: string;
  image_url: string;
  description: string;
  base_price: number;
}

export interface ParcelRequest {
  id: number;
  parcel_category_id: number;
  parcel_category_name?: string;
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  sender_lat: number;
  sender_lng: number;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  receiver_lat: number;
  receiver_lng: number;
  distance_km: number;
  weight: number;
  pickup_time: string;
  note?: string;
  price: number;
  status: string;
  created_at: string;
}

// ---------- Rental / Ride share ----------
export interface Vehicle {
  id: number;
  name: string;
  brand: string;
  model: string;
  type: 'bike' | 'car' | 'auto' | 'truck' | 'cycle';
  image_url: string;
  base_price: number;
  per_km_price: number;
  minimum_price: number;
  rating: number;
  rating_count: number;
  is_top_rated: boolean;
  seats: number;
  ac: boolean;
  description: string;
  extra_charges?: { name: string; amount: number }[];
}

export interface RideTrip {
  id: number;
  user_id: string;
  vehicle_id: number;
  vehicle_name?: string;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  destination_address: string;
  destination_lat: number;
  destination_lng: number;
  distance_km: number;
  estimated_time_min: number;
  price: number;
  status: 'requested' | 'accepted' | 'ongoing' | 'completed' | 'cancelled';
  driver_name?: string;
  driver_phone?: string;
  driver_image?: string;
  driver_rating?: number;
  vehicle_image?: string;
  created_at: string;
  completed_at?: string;
}

// ---------- Service Module ----------
export interface Service {
  id: number;
  name: string;
  category: string;
  description: string;
  image_url: string;
  base_price: number;
  duration_min: number;
  rating: number;
  rating_count: number;
  is_featured: boolean;
}

export interface ServiceBooking {
  id: number;
  service_id: number;
  service_name?: string;
  provider_id?: number;
  provider_name?: string;
  provider_image?: string;
  user_address: string;
  scheduled_at: string;
  price: number;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
  note?: string;
  created_at: string;
}

// ---------- Reels ----------
export interface Reel {
  id: number;
  title: string;
  video_url: string;
  thumbnail_url: string;
  item_id?: number;
  store_id?: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
}

// ---------- Brand ----------
export interface Brand {
  id: number;
  name: string;
  image_url: string;
  item_count: number;
  store_count: number;
  is_featured: boolean;
}

// ---------- Subscription ----------
export interface Subscription {
  id: number;
  package_name: string;
  price: number;
  duration_days: number;
  status: 'active' | 'expired' | 'cancelled';
  started_at: string;
  expired_at: string;
  features: string[];
}

// ---------- Campaign ----------
export type CampaignType = 'basic' | 'item';

export interface Campaign {
  id: number;
  title: string;
  description: string;
  image_url: string;
  type: CampaignType;
  start_date: string;
  end_date: string;
  is_active: boolean;
  status: 'ongoing' | 'upcoming' | 'expired';
}

// ---------- Settings ----------
export interface AppSettings {
  language: string;
  dark_mode: boolean;
  default_address_id: number | null;
  push_notifications: boolean;
  email_updates: boolean;
  sms_alerts: boolean;
}

// ---------- Backward-compat aliases ----------
// Old screens use Product/Vendor names; we alias them to V4.0 Item/Store.
export type Product = Item;
export type Vendor = Store;
export type FavoriteProduct = FavoriteItem;

// Helper: extract a single image URL string from Item.image_url (which can be string | string[])
// Accepts any object with image_url field — works for Item, OrderItem, etc.
export function getItemImageUrl(item: { image_url?: string | string[] | null } | any): string | null {
  if (!item?.image_url) return null;
  if (typeof item.image_url === 'string') return item.image_url;
  if (Array.isArray(item.image_url) && item.image_url.length > 0) return item.image_url[0];
  return null;
}

// Helper: get the original (pre-discount) price for display, mirroring old Product.original_price
export function getItemOriginalPrice(item: Item): number | null {
  if (item.discount_type === 'percent' && item.discount > 0) {
    return item.price / (1 - item.discount / 100);
  }
  if (item.discount_type === 'amount' && item.discount > 0) {
    return item.price + item.discount;
  }
  return null;
}

// Helper: compute effective discount percentage (0..1) for badges/UI
export function getItemDiscountPct(item: Item): number {
  const orig = getItemOriginalPrice(item);
  if (orig === null) return 0;
  return Math.max(0, (orig - item.price) / orig);
}

// Helper: extract first image URL from Store logo
export function getStoreLogoUrl(store: Store): string | null {
  return store.logo_url;
}

// Helper: map Order.order_status to legacy Order.status (string)
export function getOrderStatus(order: Order): OrderStatus {
  return order.order_status;
}
