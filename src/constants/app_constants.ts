// App-wide constants — ported from Flutter lib/util/app_constants.dart
// All API endpoints use the FoodHub REST API convention.
//
// baseUrl: read from app.json `extra.adminApiBaseUrl` if present, otherwise
// falls back to the placeholder FoodHub demo URL. The customer app reads
// from the SAME Supabase database as the admin panel by default — the REST
// base URL is only used as a secondary source for endpoints Supabase doesn't
// yet expose (e.g. payment gateways, geocoding).
import Constants from 'expo-constants';

const ADMIN_API_BASE_URL =
  Constants.expoConfig?.extra?.adminApiBaseUrl ||
  process.env.EXPO_PUBLIC_ADMIN_API_BASE_URL ||
  'https://foodhub-admin.6amtech.com';

export const AppConstants = {
  appName: 'FoodHub',
  appVersion: 4.0,
  fontFamily: 'DMSans',

  // Backend base URL — point this at the deployed admin_panel Next.js app
  // (e.g. https://your-admin.vercel.app) to use the REST fallback layer.
  // The primary data source is Supabase — see src/lib/supabase.ts.
  baseUrl: ADMIN_API_BASE_URL,

  // Auth
  loginUri: '/api/v1/auth/login',
  registerUri: '/api/v1/auth/sign-up',
  socialLoginUri: '/api/v1/auth/social-login',
  socialRegisterUri: '/api/v1/auth/social-register',
  forgetPasswordUri: '/api/v1/auth/forgot-password',
  verifyTokenUri: '/api/v1/auth/verify-token',
  resetPasswordUri: '/api/v1/auth/reset-password',
  verifyPhoneUri: '/api/v1/auth/verify-phone',
  checkEmailUri: '/api/v1/auth/check-email',
  verifyEmailUri: '/api/v1/auth/verify-email',
  tokenUri: '/api/v1/customer/cm-firebase-token',

  // Config
  configUri: '/api/v1/config',
  zoneUri: '/api/v1/config/get-zone-id',
  checkZoneUri: '/api/v1/zone/check',
  zoneListUri: '/api/v1/zone/list',
  moduleUri: '/api/v1/module',
  topOfferUri: '/api/v1/module/top-offer',

  // Categories
  categoryUri: '/api/v1/categories',
  topCategoriesUri: '/api/v1/categories/top',
  trendingSearchesUri: '/api/v1/trending-searches',
  subCategoryUri: '/api/v1/categories/childes/',
  categoryItemUri: '/api/v1/categories/items/',
  categoryStoreUri: '/api/v1/categories/stores/',

  // Banners
  bannerUri: '/api/v1/banners',
  smartBannerUri: '/api/v1/smart-banners',

  // Items / Products
  storeItemUri: '/api/v1/items/latest',
  popularItemUri: '/api/v1/items/popular',
  reviewedItemUri: '/api/v1/items/most-reviewed',
  searchItemUri: '/api/v1/items/details/',
  itemDetailsUri: '/api/v1/items/details/',
  setMenuUri: '/api/v1/items/set-menu',
  reviewUri: '/api/v1/items/reviews/submit',

  // Stores / Vendors
  storeUri: '/api/v1/stores/get-stores',
  exclusiveDealsUri: '/api/v1/stores/exclusive-deals',
  popularStoreUri: '/api/v1/stores/popular',
  latestStoreUri: '/api/v1/stores/latest',
  topOfferStoreUri: '/api/v1/stores/top-offer-near-me',
  storeDetailsUri: '/api/v1/stores/details/',
  storeReviewUri: '/api/v1/stores/reviews',

  // Customer
  customerInfoUri: '/api/v1/customer/info',
  updateProfileUri: '/api/v1/customer/update-profile',
  updateZoneUri: '/api/v1/customer/update-zone',
  interestUri: '/api/v1/customer/update-interest',
  suggestedItemUri: '/api/v1/customer/suggested-items',
  customerRemoveUri: '/api/v1/customer/remove-account',

  // Address
  addressListUri: '/api/v1/customer/address/list',
  addAddressUri: '/api/v1/customer/address/add',
  updateAddressUri: '/api/v1/customer/address/update/',
  removeAddressUri: '/api/v1/customer/address/delete?address_id=',

  // Orders
  placeOrderUri: '/api/v1/customer/order/place',
  placePrescriptionOrderUri: '/api/v1/customer/order/prescription/place',
  allOrderList: '/api/v1/customer/order/list',
  orderCancelUri: '/api/v1/customer/order/cancel',
  orderDeleteUri: '/api/v1/customer/order/delete',
  orderDetailsUri: '/api/v1/customer/order/details?order_id=',
  trackUri: '/api/v1/customer/order/track?order_id=',
  codSwitchUri: '/api/v1/customer/order/payment-method',
  walletSwitchUri: '/api/v1/customer/order/wallet-payment',
  refundReasonUri: '/api/v1/customer/order/refund-reasons',
  refundRequestUri: '/api/v1/customer/order/refund-request',
  lastLocationUri: '/api/v1/delivery-man/last-location?order_id=',

  // Coupons
  couponUri: '/api/v1/coupon/list',
  couponApplyUri: '/api/v1/coupon/apply?code=',

  // Wishlist
  wishListGetUri: '/api/v1/customer/wish-list',
  addWishListUri: '/api/v1/customer/wish-list/add?',
  removeWishListUri: '/api/v1/customer/wish-list/remove?',

  // Notifications
  notificationUri: '/api/v1/customer/notifications',

  // Wallet
  walletTransactionUri: '/api/v1/customer/wallet/transactions',

  // Loyalty
  loyaltyTransactionUri: '/api/v1/customer/loyalty-point/transactions',
  loyaltyPointTransferUri: '/api/v1/customer/loyalty-point/point-transfer',

  // Campaigns
  basicCampaignUri: '/api/v1/campaigns/basic',
  itemCampaignUri: '/api/v1/campaigns/item',
  basicCampaignDetailsUri: '/api/v1/campaigns/basic-campaign-details?basic_campaign_id=',

  // Static content
  aboutUsUri: '/api/v1/about-us',
  privacyPolicyUri: '/api/v1/privacy-policy',
  termsAndConditionUri: '/api/v1/terms-and-conditions',
  cancellationUri: '/api/v1/cancelation',
  refundUri: '/api/v1/refund-policy',
  shippingPolicyUri: '/api/v1/shipping-policy',
  subscriptionUri: '/api/v1/newsletter/subscribe',

  // Support / chat
  messageUri: '/api/v1/customer/message/get',
  supportReasonUri: '/api/v1/customer/automated-message',

  // Parcel / Taxi / Ride-share
  parcelCategoryUri: '/api/v1/parcel-category',
  vehicleListUri: '/api/v1/vehicles/list',
  vehiclesUri: '/api/v1/get-vehicles',
  topRatedVehiclesListUri: '/api/v1/vehicles/top-rated/list',
  bandListUri: '/api/v1/vehicles/brand/list',
  tripPlaceUri: '/api/v1/trip/place',
  runningTripUri: '/api/v1/trip/list',
  vehicleChargeUri: '/api/v1/vehicle/extra_charge',
  taxiCouponUri: '/api/v1/coupon/list/taxi',
  taxiBannerUri: '/api/v1/banners/taxi',

  // Vendor / DM registration
  storeRegisterUri: '/api/v1/auth/vendor/register',
  dmRegisterUri: '/api/v1/auth/delivery-man/store',

  // Map / geocoding
  searchLocationUri: '/api/v1/config/place-api-autocomplete',
  placeDetailsUri: '/api/v1/config/place-api-details',
  geocodeUri: '/api/v1/config/geocode-api',
  distanceMatrixUri: '/api/v1/config/distance-api',
  directionUri: '/api/v1/config/direction-api',

  // Search
  searchUri: '/api/v1/',

  // Local storage keys
  token: 'foodhub_token',
  userData: 'foodhub_user',
  cartList: 'foodhub_cart',
  wishList: 'foodhub_wishlist',
  recentSearchList: 'foodhub_recent_search',
  recentAddressList: 'foodhub_recent_addresses',
  language: 'foodhub_language',
  theme: 'foodhub_theme',
  currency: 'foodhub_currency',
  defaultLocation: 'foodhub_default_location',
  zoneId: 'foodhub_zone_id',
  module: 'foodhub_module',
  configs: 'foodhub_configs',
  notification: 'foodhub_notification',
  notificationCount: 'foodhub_notification_count',
  intro: 'foodhub_intro',
  customerId: 'foodhub_customer_id',
  guestMode: 'foodhub_guest_mode',
  moduleSetting: 'foodhub_module_setting',
  dmTip: 'foodhub_dm_tip',
  parcelInstructions: 'foodhub_parcel_instructions',
  initialCountryCode: 'foodhub_initial_country_code',

  // Misc
  balanceInputLen: 10,
  messageInputLength: 1000,
  webMaxWidth: 1170,
} as const;

export type AppConstantsType = typeof AppConstants;
