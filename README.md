# FoodHub Customer App (V5.0)

A full-featured React Native (Expo SDK 57) multi-vendor marketplace app for groceries, pharmacies, shops, food, and parcels — built to match the FoodHub User App V4.0 Flutter design, using **Supabase** for auth and data storage, with a FoodHub-style REST API client layered in.

> Ported from the Flutter V4.0 User App. The RN app now ships with all 45+ feature modules from the original Flutter app.

## What's New in V4.0

This version is a comprehensive port of the Flutter V4.0 user app to React Native (Expo):

### Foundation
- **DMSans font family** — 4 weights (Regular, Medium, SemiBold, Bold) ported from Flutter
- **345 Flutter images** — all V4.0 assets copied to `assets/images/flutter/`
- **4 languages** — English, Arabic, Spanish, Bengali (loaded from Flutter's translation JSONs)
- **Light + Dark theme** — ported from Flutter's `light_theme.dart` / `dark_theme.dart` with full color tokens
- **Dimensions, Styles, AppConstants** — direct ports of Flutter's util classes
- **i18n via `t(key)`** — drop-in replacement for Flutter's `.tr` extension

### Architecture
- **ApiClient** — mirrors Flutter's `lib/api/api_client.dart` (getData/postData/putData/deleteData/multipartRequest)
- **ApiChecker + ResponseModel** — error-handling helpers
- **Stores** (React Context + hooks) mirroring Flutter's GetX controllers:
  - `auth`, `cart`, `favorites`, `orders` (extended)
  - **NEW**: `theme`, `notifications`, `wallet`, `loyalty`, `coupons`
- **Types** — full V4.0 type system (Item, Store, Order, Coupon, WalletTransaction, LoyaltyTransaction, ParcelCategory, Vehicle, Service, Reel, Brand, Campaign, etc.)

### Feature Modules (Ported from Flutter V4.0)

| # | Feature | Status |
|---|---------|--------|
| 1 | Auth (email/password, OTP, Google, Facebook, Apple, guest) | ✅ |
| 2 | Onboarding (language select + welcome carousel) | ✅ |
| 3 | Home (banners, categories, stores, items, flash sale, offers) | ✅ |
| 4 | Item/Product detail (variations, add-ons, related, reviews) | ✅ |
| 5 | Store/Vendor detail (info, items, reviews) | ✅ |
| 6 | Category listing (subcategories, filters, items grid) | ✅ |
| 7 | Cart (vendor-grouped, variations, add-ons, bill details) | ✅ |
| 8 | Checkout (address, payment methods, schedule, place order) | ✅ |
| 9 | Order list + detail (timeline, cancel, track) | ✅ |
| 10 | Order success | ✅ |
| 11 | Offers (tabs: Grocery/Pharmacy/Shop/Food, filters: All/Items/Stores) | ✅ |
| 12 | Favourites (stores + items) | ✅ |
| 13 | Profile (user card, stats, all menu sections) | ✅ |
| 14 | Wallet (balance, top-up, transactions, convert loyalty) | ✅ NEW |
| 15 | Loyalty (points, history, convert to wallet) | ✅ NEW |
| 16 | Coupons (list, claim, apply) | ✅ NEW |
| 17 | Refer & Earn (referral code, share, how-it-works) | ✅ NEW |
| 18 | Flash Sale (deals grid, countdown timer) | ✅ NEW |
| 19 | Notifications (list, mark read, mark all) | ✅ NEW |
| 20 | Address (list, add/edit, map picker) | ✅ |
| 21 | Search (recent, suggestions, results) | ✅ |
| 22 | Chat (conversations list, message thread) | ✅ NEW |
| 23 | Parcel (categories, send form, pricing) | ✅ NEW |
| 24 | Ride-share (vehicle list, booking confirmation, fare breakdown) | ✅ NEW |
| 25 | Rental (vehicle list, day-rate pricing) | ✅ NEW |
| 26 | Service module (service list, detail, booking) | ✅ NEW |
| 27 | Reels (vertical pager, like/comment/share) | ✅ NEW |
| 28 | Brands (grid, featured badges) | ✅ NEW |
| 29 | Settings (language, dark mode, notifications, address) | ✅ |
| 30 | Edit profile | ✅ |
| 31 | Help & support | ✅ |
| 32 | Static pages (About, Privacy, Terms, Cancellation, Refund, Shipping) | ✅ NEW |
| 33 | Vendor registration | ✅ NEW |
| 34 | Delivery man registration | ✅ NEW |

### Backend Strategy

The app uses a **three-tier backend fallback**:

1. **REST API** (preferred) — calls the FoodHub admin backend (`AppConstants.baseUrl`). All endpoints are listed in `src/constants/app_constants.ts`.
2. **Supabase** — used for auth, and as a fallback for orders/cart persistence when REST is unavailable.
3. **Local demo data** — `src/data/demo-data.ts` ships with realistic mock data for every feature, so the app is fully functional out-of-the-box even with no backend configured.

To wire up Supabase, set `expo.extra.supabaseUrl` and `expo.extra.supabaseAnonKey` in `app.json`, then run `src/supabase/schema.sql` against your database.

To use the REST backend, edit `src/constants/app_constants.ts` → `baseUrl`.

## Project Structure

```
customar/
├── app.json                       # Expo config (fonts, splash, icons, plugins)
├── package.json                   # Dependencies (Expo SDK 57)
├── tsconfig.json
├── assets/
│   ├── fonts/                     # DMSans-Regular/Medium/SemiBold/Bold.ttf
│   ├── images/flutter/            # 345 Flutter V4.0 images
│   ├── languages/                 # en/ar/bn/es JSON (Flutter's translation files)
│   ├── map/                       # Map style JSONs
│   └── json/                      # Misc JSON configs
└── src/
    ├── app/                       # expo-router routes (45+ screens)
    │   ├── (tabs)/                # home, offers, orders, favourite, profile
    │   ├── auth/                  # login / signup / OTP / social
    │   ├── onboarding/            # welcome carousel
    │   ├── cart/                  # cart + checkout + order-success
    │   ├── order/                 # order list + detail
    │   ├── product/               # product detail
    │   ├── vendor/                # vendor detail
    │   ├── category/              # category listing
    │   ├── search/                # search
    │   ├── address-list/          # saved addresses
    │   ├── address-edit/          # add/edit address
    │   ├── wallet/                # wallet balance + transactions
    │   ├── loyalty/               # loyalty points + history
    │   ├── coupon/                # coupon list
    │   ├── refer-earn/            # referral program
    │   ├── flash-sale/            # flash sale deals
    │   ├── notifications/         # notifications list
    │   ├── chat/                  # chat conversations
    │   ├── parcel/                # parcel send
    │   ├── ride-share/            # ride booking
    │   ├── rental/                # vehicle rentals
    │   ├── service/               # home services
    │   ├── reels/                 # short videos
    │   ├── brands/                # brand directory
    │   ├── html/[type]/           # about/privacy/terms/etc.
    │   ├── vendor-register/       # vendor signup
    │   ├── delivery-register/     # delivery man signup
    │   ├── settings/              # app settings
    │   ├── edit-profile/          # profile editor
    │   ├── language/              # language picker
    │   ├── help/                  # help & support
    │   └── about/                 # about us
    ├── components/ui/             # Reusable UI components (Button, Card, Input, etc.)
    ├── constants/
    │   ├── theme.ts               # Light + Dark color tokens (Flutter port)
    │   ├── app_constants.ts       # API endpoints + storage keys (Flutter port)
    │   ├── dimensions.ts          # Spacing/sizing (Flutter port)
    │   ├── images.ts              # Asset path constants (Flutter port)
    │   ├── styles.ts              # Typography presets + shadows (Flutter port)
    │   ├── i18n.tsx               # Translation provider (en/ar/bn/es)
    │   └── categories.ts          # Category configuration
    ├── store/                     # React Context stores
    │   ├── auth.tsx               # Auth + user profile
    │   ├── cart.tsx               # Vendor-grouped cart with variations
    │   ├── favorites.tsx          # Item + store favorites
    │   ├── orders.tsx             # Order placement + tracking
    │   ├── theme.tsx              # Light/dark mode toggle
    │   ├── notifications.tsx      # Notifications
    │   ├── wallet.tsx             # Wallet balance + transactions
    │   ├── loyalty.tsx            # Loyalty points
    │   └── coupons.tsx            # Coupons
    ├── lib/
    │   ├── api_client.ts          # REST API client (Flutter port)
    │   ├── supabase.ts            # Supabase client
    │   ├── data.ts                # Data access layer (REST → Supabase → demo)
    │   └── responsive.ts          # Screen-size helpers
    ├── data/
    │   └── demo-data.ts           # Mock data for all features
    ├── types/
    │   └── index.ts               # V4.0 TypeScript types
    └── supabase/
        └── schema.sql             # Database schema
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Install & Run
```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm start
# or: npx expo start

# 3. Run on device / emulator
npm run android    # Android
npm run ios        # iOS (requires macOS + Xcode)
npm run web        # Web
```

### Type Check
```bash
npm run typecheck
```

## Configuration

### Supabase (Optional)
1. Create a project at https://supabase.com
2. Set `expo.extra.supabaseUrl` and `expo.extra.supabaseAnonKey` in `app.json`
3. Run `src/supabase/schema.sql` against your database

### REST Backend (Optional)
Edit `src/constants/app_constants.ts`:
```ts
baseUrl: 'https://your-foodhub-backend.com',
```

### Without Any Backend
The app ships with full demo data (`src/data/demo-data.ts`) and works out-of-the-box. Sign in with any email/password (demo mode) or continue as guest.

## Tech Stack
- **React Native** 0.86
- **Expo** SDK 57 (expo-router for navigation)
- **TypeScript** 6
- **Supabase** for auth + database
- **React Context** for state management (mirrors Flutter's GetX pattern)
- **DMSans** font family (Flutter port)
- **MaterialCommunityIcons + Ionicons** for iconography

## License
See `LICENSE` file.
# FoodAdmin
