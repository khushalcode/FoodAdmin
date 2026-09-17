// ============================================================================
// FoodHub — Food Module Marketing Copy & Grocery-Ported UI Strings
// ----------------------------------------------------------------------------
// Ported from BlinkSyGold Flutter V4.0 grocery section, rewritten for the
// FoodHub food-only customer app. Use these strings throughout the food UI
// for hero banners, section titles, CTAs, badges, and empty states.
//
// Every string is food-focused ("hot & fresh", "kitchen", "chef", "plated",
// "fork", "spice") — NO grocery terminology ("cart", "aisle", "shelf").
// ============================================================================

export const FoodCopy = {
  // ----------------------------------------------------------------- HERO
  hero: {
    title: 'Crave It. Tap It. Devour It.',
    subtitle:
      'From sizzling burgers to wood-fired pizzas and hand-rolled sushi — your favourite kitchens, plated fresh and delivered hot to your door in 30 minutes or less.',
    cta: 'Order Now',
    secondaryCta: 'Explore Menus',
    badge: '🔥 #1 Food Delivery in Your City',
    locationPrompt: 'Tell us where you are and we’ll bring the feast to you',
  },

  // -------------------------------------------------------------- ONBOARDING
  onboarding: [
    {
      id: 'crave',
      title: 'Your Cravings, Answered',
      subtitle:
        'Browse menus from the best restaurants in your city — burgers, pizza, sushi, tacos, pasta and more, all in one app.',
    },
    {
      id: 'fresh',
      title: 'Hot, Fresh & On Time',
      subtitle:
        'Every dish leaves the kitchen at peak flavour. Track it live from chef to doorstep — no cold food, ever.',
    },
    {
      id: 'offers',
      title: 'Feast More, Pay Less',
      subtitle:
        'Unlock daily deals, flash sales, cashback on every order and loyalty points that convert to wallet money.',
    },
    {
      id: 'savour',
      title: 'Savour the Savings',
      subtitle:
        'Free delivery over $20, member-only discounts, and exclusive coupons from your favourite kitchens — every single day.',
    },
  ],

  // ------------------------------------------------------------ HOME SECTIONS
  sections: {
    categoriesHeading: 'What’s on your plate today?',
    categoriesSub: 'Pick a craving — we’ll handle the rest',
    popularNearby: 'Popular Bites Nearby',
    popularNearbySub: 'What your neighbours are ordering right now',
    bestReviewed: 'Top Rated This Week',
    bestReviewedSub: 'Dishes with the highest chef scores and cleanest plates',
    bestStoreNearby: 'Best Kitchens Near You',
    bestStoreSub: 'Hand-picked restaurants rated 4.5★ and above',
    exclusiveDeals: 'Exclusive Kitchen Deals',
    exclusiveDealsSub: 'Limited-time offers from your favourite chefs',
    flashSale: '⚡ Flash Bites',
    flashSaleSub: 'Deals gone in 60 minutes — grab them hot',
    newOnPlatform: 'New Kitchens on FoodHub',
    newOnPlatformSub: 'Freshly onboarded restaurants worth a try',
    recommendedForYou: 'Plated Just For You',
    recommendedSub: 'Based on your taste and past orders',
    brands: 'Trusted Brands You Love',
    brandsSub: 'The names behind your favourite meals',
    blogs: 'From Our Food Journal',
    blogsSub: 'Recipes, chef stories and food guides',
    campaigns: 'Live Campaigns',
    campaignsSub: 'Seasonal feasts and festival specials',
    subscription: '🍔 Join FoodHub Plus',
    subscriptionSub: 'Free delivery, exclusive deals & priority chefs — $4.99/mo',
    loyaltyStrip: 'Earn points on every bite. Redeem for wallet money.',
    cashbackStrip: 'Get up to 10% cashback on orders above $25',
  },

  // ------------------------------------------------------------ ITEM / DISH
  dish: {
    allergenTitle: 'Allergen Info',
    allergenSub: 'Please review before you order',
    nutritionTitle: 'Nutrition Facts',
    nutritionSub: 'Per serving',
    ingredientsTitle: 'What’s Inside',
    ingredientsSub: 'Every ingredient that goes into your dish',
    tagsTitle: 'Dietary Tags',
    veg: '🌿 Pure Veg',
    nonVeg: '🍗 Non-Veg',
    halal: 'Islam ✓ Halal Certified',
    organic: '🌱 100% Organic',
    glutenFree: 'Gluten-Free',
    spicy: '🌶️ Spicy',
    chefSpecial: '👨‍🍳 Chef’s Special',
    bestSeller: '🏆 Best Seller',
    isNew: '✨ New on Menu',
    stockLow: 'Only a few plates left!',
    stockOut: 'Sold out for today',
    restockCta: 'Notify me when it’s back',
    restockSub: 'We’ll ping you the moment the chef plates it again',
    restockSubAlt: 'I’ll wait until it’s restocked',
    bulkTitle: 'Bulk Order? Save More',
    bulkSub: 'Order 3+ portions and unlock automatic savings',
    bulkCta: 'Add 3 portions — Save $X',
    relatedTitle: 'Pairs beautifully with',
    relatedSub: 'Chef’s recommendations to complete your meal',
    reviewsTitle: 'Diner Reviews',
    reviewsSub: 'Real experiences from real foodies',
    addOnsTitle: 'Make it your own',
    addOnsSub: 'Extras, sides & sauces',
    variationsTitle: 'Choose your style',
    variationsSub: 'Size, spice level, crust, dressing',
    quantityTitle: 'How many plates?',
    noteTitle: 'Special instructions for the chef',
    notePlaceholder: 'e.g., extra crispy, no onions, less spice',
  },

  // ------------------------------------------------------------ VENDOR / STORE
  vendor: {
    bulkDiscountTitle: 'Bulk Order Discount',
    bulkDiscountSub: 'Order more, save more — automatic savings applied',
    bulkProgress: 'You’re {remaining} away from unlocking {percent}% off',
    bulkUnlocked: '🎉 Bulk discount unlocked! You saved {amount}',
    freeDeliveryTitle: 'Free Delivery Progress',
    freeDeliverySub: 'Add {remaining} more to get free delivery',
    freeDeliveryUnlocked: '🎉 Free delivery unlocked!',
    loyaltyTitle: 'Earn Loyalty Points',
    loyaltySub: 'Get {points} points on this order — worth {amount} in wallet money',
    cashbackTitle: 'Cashback Offer',
    cashbackSub: 'Get {percent}% cashback after order completion',
    scheduleTitle: 'Pre-order for later',
    scheduleSub: 'Schedule your meal for up to 7 days in advance',
    scheduleCta: 'Choose delivery time',
    restockTitle: 'Restocked in this kitchen',
    restockSub: 'Your waitlisted dishes, back on the menu',
    openHours: 'Kitchen Hours',
    ratingTitle: 'What diners are saying',
    subscriptionTitle: 'Subscribe & Save',
    subscriptionSub: 'Get this meal delivered weekly and save 15%',
    subscriptionCta: 'Start Subscription',
    minimumOrder: 'Minimum order {amount}',
    deliveryFee: 'Delivery fee {amount}',
    selfPickup: 'Pickup available',
    zoneRestricted: 'Delivers to your zone',
    verifiedKitchen: 'Verified Kitchen',
    promoted: 'Promoted Kitchen',
    topRated: '🏆 Top Rated Kitchen',
    expressKitchen: '⚡ Express Kitchen',
  },

  // ------------------------------------------------------------ BADGES / PILLS
  badges: {
    trending: 'Trending Now',
    hotDeal: '🔥 Hot Deal',
    fresh: 'Just Plated',
    mustTry: 'Must Try',
    chefPick: 'Chef’s Pick',
    lighteningDeal: '⚡ Lightning Deal',
    memberOnly: 'Member Only',
    freeDelivery: 'Free Delivery',
    expressDelivery: 'Express 20 min',
    topRated: 'Top Rated',
    bestValue: 'Best Value',
    limitedTime: 'Limited Time',
    newOnFoodHub: 'New on FoodHub',
    exclusive: 'Exclusive',
    premium: 'Premium',
    pro: 'PRO',
  },

  // ------------------------------------------------------------ EMPTY STATES
  empty: {
    noRestaurants: 'No Kitchens Nearby',
    noRestaurantsSub: 'We couldn’t find any open restaurants in your area. Try expanding your search radius or changing your address.',
    noItems: 'No Dishes Found',
    noItemsSub: 'This kitchen hasn’t listed any dishes yet. Check back soon — the chef is cooking up something new!',
    noOrders: 'No Orders Yet',
    noOrdersSub: 'Your past orders will appear here. Time to place your first feast!',
    noFavorites: 'No Favourites Yet',
    noFavoritesSub: 'Tap the heart on any dish or kitchen to save it here for quick reordering.',
    noSearch: 'No Results Found',
    noSearchSub: 'Try a different dish name, cuisine, or ingredient — like “spicy ramen” or “wood-fired pizza”.',
    noCart: 'Your Plate is Empty',
    noCartSub: 'Add some delicious dishes from your favourite kitchens to get started.',
    noNotifications: 'No Notifications',
    noNotificationsSub: 'Order updates, deals and chef announcements will show up here.',
    noRestock: 'No Restock Alerts',
    noRestockSub: 'When you tap “Notify me when it’s back”, we’ll list those dishes here.',
    noReviews: 'No Reviews Yet',
    noReviewsSub: 'Be the first to share your dining experience with the community.',
  },

  // ------------------------------------------------------------ CTA / ACTIONS
  cta: {
    addToCart: 'Add to Cart',
    addToPlate: 'Add to Plate',
    buyNow: 'Order Now',
    reorder: 'Reorder',
    viewMenu: 'View Full Menu',
    seeAllRestaurants: 'See All Kitchens',
    seeAllItems: 'See All Dishes',
    seeAllOffers: 'See All Offers',
    claimOffer: 'Claim Offer',
    applyCoupon: 'Apply Coupon',
    scheduleOrder: 'Schedule Order',
    startSubscription: 'Start Subscription',
    notifyRestock: 'Notify Me',
    rateOrder: 'Rate Your Order',
    tipChef: 'Tip the Chef',
    shareDish: 'Share This Dish',
    shareKitchen: 'Share This Kitchen',
    callKitchen: 'Call Kitchen',
    chatWithKitchen: 'Chat with Kitchen',
  },

  // ------------------------------------------------------------ LOYALTY / WALLET
  loyalty: {
    pointsBalance: 'Your Flavour Points',
    pointsSub: 'Earn 1 point for every $1 spent — redeem for wallet money anytime',
    convertCta: 'Convert to Wallet',
    convertSub: '100 points = $1 in wallet money',
    historyTitle: 'Points History',
    earned: 'Points Earned',
    redeemed: 'Points Redeued',
    pending: 'Pending Points',
    expiryWarning: '⚠️ {points} points expire in {days} days — redeem now!',
  },

  wallet: {
    balance: 'Wallet Balance',
    topUp: 'Top Up Wallet',
    topUpSub: 'Add funds via secure digital payment gateways',
    cashbackEarned: 'Cashback Earned',
    cashbackPending: 'Cashback Pending',
    convertFromLoyalty: 'Convert Loyalty → Wallet',
    history: 'Transaction History',
  },

  // ------------------------------------------------------------ PAYMENT
  payment: {
    cod: 'Cash on Delivery',
    codSub: 'Pay when your food arrives',
    digital: 'Digital Payment',
    digitalSub: 'Card, UPI, wallet — secure & instant',
    wallet: 'Pay with Wallet',
    walletSub: 'Use your FoodHub wallet balance',
    partial: 'Partial Payment',
    partialSub: 'Split between wallet & another method',
    online: 'Pay Online',
    onlineSub: 'All major cards & net banking',
  },

  // ------------------------------------------------------------ SUCCESS
  success: {
    orderPlaced: '🎉 Order Placed!',
    orderPlacedSub: 'Your feast is being prepared by the chef',
    estimatedDelivery: 'Estimated delivery in {minutes} minutes',
    trackOrder: 'Track Your Order',
    backToHome: 'Back to Home',
    pointsEarned: 'You earned {points} flavour points!',
    cashbackEarned: 'You’ll get {amount} cashback after delivery',
  },

  // ------------------------------------------------------------ FILTERS / SORT
  filter: {
    title: 'Filter Kitchens',
    sortBy: 'Sort by',
    nearest: 'Nearest First',
    topRated: 'Top Rated',
    popularity: 'Most Popular',
    deliveryTime: 'Fastest Delivery',
    deliveryFee: 'Lowest Delivery Fee',
    priceRange: 'Price Range',
    cuisine: 'Cuisine Type',
    dietary: 'Dietary Preferences',
    vegOnly: 'Pure Veg Only',
    openNow: 'Open Now',
    freeDelivery: 'Free Delivery Only',
    expressOnly: 'Express Delivery Only',
    apply: 'Apply Filters',
    reset: 'Reset All',
  },

  // ------------------------------------------------------------ SCHEDULE
  schedule: {
    asap: 'As soon as possible ({minutes} min)',
    today: 'Today',
    tomorrow: 'Tomorrow',
    chooseSlot: 'Choose a delivery slot',
    slotsAvailable: '{count} slots available today',
    breakfast: 'Breakfast · 7–11 AM',
    lunch: 'Lunch · 11 AM–3 PM',
    snacks: 'Evening Snacks · 3–7 PM',
    dinner: 'Dinner · 7–11 PM',
    lateNight: 'Late Night · 11 PM–2 AM',
  },

  // ------------------------------------------------------------ ADDRESS / DELIVERY
  delivery: {
    instructionsTitle: 'Delivery Instructions',
    instructionsSub: 'Help your delivery partner serve you better',
    leaveAtDoor: 'Leave at the front door',
    leaveAtReception: 'Deliver to the reception desk',
    avoidCalling: 'Avoid calling me',
    callAsap: 'Call me ASAP',
    callIfUnavailable: 'Call me if I’m not available',
    ringBell: 'Ring the doorbell',
    noContact: 'No-contact delivery',
  },

  // ------------------------------------------------------------ SUBSCRIPTION
  subscription: {
    title: 'FoodHub Plus Membership',
    tagline: 'Eat more. Save more. Every single day.',
    monthlyPrice: '$4.99',
    yearlyPrice: '$39.99',
    yearlySavings: 'Save 33% with yearly plan',
    benefits: [
      '🚚 Free delivery on every order, no minimum',
      '💰 Exclusive member-only deals up to 30% off',
      '⚡ Priority chef — your orders jump the queue',
      '🎁 Welcome bonus: 500 flavour points instantly',
      '📊 Early access to flash sales & new kitchens',
      '🔔 Restock alerts before anyone else',
    ],
    cta: 'Join FoodHub Plus',
    cancelAnytime: 'Cancel anytime. No questions asked.',
  },

  // ------------------------------------------------------------ FLASH SALE
  flashSale: {
    title: '⚡ Flash Bites',
    subtitle: 'Deals so hot, they’re gone in 60 minutes',
    endsIn: 'Ends in',
    soldOut: 'Sold Out',
    onlyLeft: 'Only {count} left!',
    grabDeal: 'Grab Deal',
    viewAll: 'View All Flash Deals',
  },

  // ------------------------------------------------------------ BULK DISCOUNT TIERS
  bulkDiscountTiers: [
    { minQty: 3,  percent: 5,  label: '3+ portions · 5% off' },
    { minQty: 5,  percent: 10, label: '5+ portions · 10% off' },
    { minQty: 10, percent: 15, label: '10+ portions · 15% off' },
    { minQty: 20, percent: 20, label: '20+ portions · 20% off' },
  ],

  // ------------------------------------------------------------ REFER & EARN
  refer: {
    title: 'Invite Friends, Feast Free',
    subtitle: 'Give $5, get $5 — when your friend places their first order',
    codeLabel: 'Your Referral Code',
    shareCta: 'Share Your Code',
    howItWorks: [
      'Share your unique code with friends',
      'They sign up and place their first order',
      'You both get $5 in your wallet instantly',
      'Earn unlimited — refer as many friends as you want',
    ],
  },

  // ------------------------------------------------------------ CAMPAIGNS
  campaigns: {
    ramadan: '🌙 Ramadan Iftar Special — Up to 25% off',
    christmas: '🎄 Christmas Feast — Family meals from $19',
    newYear: '🎆 New Year, New Cravings — Buy 1 Get 1 Free',
    valentine: '💝 Valentine’s Date Night — Couples combos',
    summer: '☀️ Summer Coolers — Beat the heat with chilled drinks',
    weekend: '🎉 Weekend Feast — Sunday brunch specials',
  },
} as const;

// ----------------------------------------------------------------- HELPERS
// Templated string resolver — `t('You’re {remaining} away from {percent}% off', { remaining: '$5', percent: 10 })`
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{${k}}`
  );
}
