// FoodHub — Food-only category configuration.
// Updated from the original multi-module version (grocery/pharmacy/shop/food/parcel)
// to show ONLY food categories. The home tab design is preserved — just the data
// behind it changed to food-only.

export type CategoryKey = 'home' | 'food';

export interface CategoryConfig {
  key: CategoryKey;
  label: string;
  icon: string;            // icon name from @expo/vector-icons/MaterialCommunityIcons
  color: string;           // accent color
  bg: string;              // pastel background
  tagline: string;
  deliveryTime: string;
  image?: string;          // local image path for the category card
}

// Only ONE top-level category: Food
export const CATEGORIES: CategoryConfig[] = [
  {
    key: 'food',
    label: 'Food',
    icon: 'food-apple-outline',
    color: '#FF6B35',
    bg: '#FFF4EF',
    tagline: 'Hot & fresh meals near you',
    deliveryTime: '25–40 min',
    image: '../../assets/images/food/banner1.jpg',
  },
];

// Food subcategories — dish types shown in "Browse by Category" section
export interface SubCategory {
  id: string;
  label: string;
  icon: string;          // MaterialCommunityIcons name
  bg: string;            // pastel circle background
  parent: CategoryKey;
  image?: string;        // local image path
}

export const SUB_CATEGORIES: SubCategory[] = [
  { id: 'burgers',   label: 'Burgers',   icon: 'food',                bg: '#FFEDD5', parent: 'food', image: '../../assets/images/food/burger.jpg' },
  { id: 'pizza',     label: 'Pizza',     icon: 'pizza',               bg: '#FFE4E6', parent: 'food', image: '../../assets/images/food/pizza.jpg' },
  { id: 'sushi',     label: 'Sushi',     icon: 'fish',                bg: '#DBEAFE', parent: 'food', image: '../../assets/images/food/sushi.jpg' },
  { id: 'tacos',     label: 'Tacos',     icon: 'taco',                bg: '#FEF3C7', parent: 'food', image: '../../assets/images/food/tacos.jpg' },
  { id: 'pasta',     label: 'Pasta',     icon: 'pasta',               bg: '#F3E8FF', parent: 'food', image: '../../assets/images/food/pasta.jpg' },
  { id: 'salads',    label: 'Salads',    icon: 'bowl-mix-outline',    bg: '#DCFCE7', parent: 'food', image: '../../assets/images/food/salad.jpg' },
  { id: 'desserts',  label: 'Desserts',  icon: 'cake-variant-outline', bg: '#FCE7F3', parent: 'food', image: '../../assets/images/food/dessert.jpg' },
  { id: 'beverages', label: 'Beverages', icon: 'cup-water',           bg: '#E0F2FE', parent: 'food', image: '../../assets/images/food/beverages.jpg' },
];

export const QUICK_FILTERS = [
  { id: 'offers', label: 'Offers', icon: 'tag', color: '#FF6B35' },
  { id: 'express', label: 'Express Delivery', icon: 'moped', color: '#C7283F' },
  { id: 'top-rated', label: 'Top Rated', icon: 'star', color: '#F59E0B' },
] as const;

// Bottom navigation tabs
export const BOTTOM_TABS = [
  { key: 'offers', label: 'Offers', icon: 'tag-outline', activeIcon: 'tag' },
  { key: 'orders', label: 'Orders', icon: 'clipboard-text-outline', activeIcon: 'clipboard-text' },
  { key: 'favourite', label: 'Favourite', icon: 'heart-outline', activeIcon: 'heart' },
  { key: 'profile', label: 'Profile', icon: 'account-outline', activeIcon: 'account' },
] as const;

// Onboarding language options
export interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
  flag: string; // emoji
  available: boolean;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸', available: true },
  { code: 'ar', label: 'Arabic', nativeLabel: 'عربي', flag: '🇸🇩', available: true },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸', available: false },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', flag: '🇧🇩', available: false },
];

// Onboarding welcome carousel slides — food-focused
export interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  illustration: string; // MaterialCommunityIcons name
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'all-needs',
    title: 'Your Favorite Food, Delivered',
    subtitle: 'Order from the best restaurants in your city — burgers, pizza, sushi, and more.',
    illustration: 'food-apple',
  },
  {
    id: 'fast-delivery',
    title: 'Fast Delivery, Every Time',
    subtitle: 'Get your food delivered hot and fresh to your doorstep in 30 minutes or less.',
    illustration: 'moped',
  },
  {
    id: 'best-prices',
    title: 'Best Prices & Exclusive Offers',
    subtitle: 'Save big with daily deals, exclusive offers, and member-only discounts on food.',
    illustration: 'tag-heart',
  },
];
