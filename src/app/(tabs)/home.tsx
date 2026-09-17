// Home dashboard — main landing screen after auth.
// Page 4 of the PDF design mockup.

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { CATEGORIES, SUB_CATEGORIES } from '@/constants/categories';
import { StatusBar } from '@/components/ui/status-bar';
import { Card } from '@/components/ui/card';
import { SectionHeader, DiscountBadge, FavoriteButton, AddButton, Rating, AdBadge, DeliveryTimePill } from '@/components/ui/index';
import { FoodCopy } from '@/constants/food_copy';
import { DEMO_FOOD_BRANDS, DEMO_BLOG_POSTS, DEMO_FLASH_SALES, DEMO_LOYALTY_TIERS } from '@/data/food_features_demo';
import { fetchVendors, fetchProducts } from '@/lib/data';
import { fetchLiveBanners, fetchLiveCoupons } from '@/lib/admin-data';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import { useFavorites } from '@/store/favorites';
import type { Vendor, Product, CategoryKey } from '@/types'; import { getItemImageUrl } from '@/types';
import { useCustomerRealtime } from '@/lib/realtime';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  onTabNavigate?: (k: any) => void;
}

export function HomeScreen({ onTabNavigate }: HomeScreenProps) {
  const router = useRouter();
  const { session } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'home' | CategoryKey>('home');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [liveBanners, setLiveBanners] = useState<any[]>([]);
  const [liveCoupons, setLiveCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [categoriesSheetOpen, setCategoriesSheetOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Realtime subscription — order status updates from admin/vendor trigger a
  // banner refresh + local push notification (handled inside the hook).
  useCustomerRealtime(
    session.user?.id,
    () => {
      // Order status changed — could refresh order list here; home stays light.
    },
    () => {
      // New notification from admin — could refresh notifications badge.
    },
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const [v, p, b, c] = await Promise.all([
        fetchVendors({ featured: true, limit: 6 }),
        fetchProducts({ featured: true, limit: 8 }),
        fetchLiveBanners({ limit: 8 }),
        fetchLiveCoupons({ limit: 5 }),
      ]);
      if (mounted) {
        setVendors(v);
        setFeaturedProducts(p);
        setLiveBanners(b);
        setLiveCoupons(c);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleCategoryPress = (cat: CategoryKey) => {
    router.push(`/category/${cat}`);
  };

  const handleSearchPress = () => {
    router.push('/search');
  };

  const handleVendorPress = (v: Vendor) => {
    router.push(`/vendor/${v.id}`);
  };

  const handleProductPress = (p: Product) => {
    router.push(`/product/${p.id}`);
  };

  const handleCartPress = () => {
    router.push('/cart');
  };

  const handleNotifications = () => {
    router.push('/notifications');
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          setShowBackToTop(y > 400);
        }}
        scrollEventThrottle={16}
      >
        {/* Delivery location header */}
        <View style={styles.locationHeader}>
          <Pressable style={styles.locationLeft} onPress={() => router.push('/address-list')}>
            <Text style={styles.deliverToLabel}>Deliver To</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.deliverToAddress} numberOfLines={1}>
                V48M+7J3, Siroliya, Madhy...
              </Text>
              <Ionicons name="chevron-down" size={14} color={Colors.text} />
            </View>
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable onPress={handleNotifications} hitSlop={8}>
              <Ionicons name="notifications-outline" size={22} color={Colors.text} />
            </Pressable>
            <Pressable onPress={handleCartPress} hitSlop={8}>
              <Ionicons name="cart-outline" size={22} color={Colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Category tabs */}
        <CategoryTabs
          active={activeCategory}
          onChange={(c) => {
            if (c === 'home') {
              setActiveCategory('home');
            } else {
              handleCategoryPress(c);
            }
          }}
        />

        {/* Search bar */}
        <Pressable style={styles.searchBar} onPress={handleSearchPress}>
          <Text style={styles.searchPlaceholder}>
            Search for '<Text style={styles.searchTerm}>{activeCategory === 'home' ? 'Shop' : capitalize(activeCategory)}</Text>'
          </Text>
          <Ionicons name="search" size={18} color={Colors.textTertiary} />
        </Pressable>

        {/* Service category cards — FoodHub shows food categories only */}
        <View style={styles.categoryCardsWrap}>
          <CategoryCardBig
            category={CATEGORIES[0]}
            onPress={() => handleCategoryPress('food')}
          />
          <View style={styles.categorySmallRow}>
            <CategoryCardSmall category={SUB_CATEGORIES[0]} onPress={() => handleCategoryPress('food')} />
            <CategoryCardSmall category={SUB_CATEGORIES[1]} onPress={() => handleCategoryPress('food')} />
            <CategoryCardSmall category={SUB_CATEGORIES[2]} onPress={() => handleCategoryPress('food')} />
          </View>
          <View style={styles.categorySmallRow}>
            <CategoryCardSmall category={SUB_CATEGORIES[3]} onPress={() => handleCategoryPress('food')} />
            <CategoryCardSmall category={SUB_CATEGORIES[4]} onPress={() => handleCategoryPress('food')} />
            <CategoryCardSmall category={SUB_CATEGORIES[7]} onPress={() => handleCategoryPress('food')} />
          </View>
          <Pressable hitSlop={8} style={styles.seeMoreRow} onPress={() => setCategoriesSheetOpen(true)}>
            <Text style={styles.seeMoreText}>See More</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.info} />
          </Pressable>
        </View>

        {/* More services row — food-focused only */}
        <View style={styles.moreServicesWrap}>
          <MoreServiceCard icon="flash" label="Flash Sale" color={Colors.danger} onPress={() => router.push('/flash-sale')} />
          <MoreServiceCard icon="play-circle" label="Reels" color={Colors.info} onPress={() => router.push('/reels')} />
          <MoreServiceCard icon="tag-heart" label="Coupons" color={Colors.primary} onPress={() => router.push('/coupon')} />
          <MoreServiceCard icon="star" label="Popular" color={Colors.warning} onPress={() => router.push('/popular-items')} />
          <MoreServiceCard icon="store" label="All Food" color={Colors.accent} onPress={() => router.push('/all-stores')} />
        </View>

        {/* Promotional banners: food-focused — V5.1 attractive copy */}
        <View style={styles.bannersWrap}>
          <PromoBanner
            title={FoodCopy.hero.title}
            subtitle={FoodCopy.hero.subtitle}
            icon="🍔"
            bg={Colors.catOrange}
          />
          <PromoBanner
            title={FoodCopy.sections.loyaltyStrip}
            subtitle={FoodCopy.sections.cashbackStrip}
            icon="🛵"
            bg={Colors.primaryLight}
          />
        </View>

        {/* Hero carousel */}
        <HeroCarousel />

        {/* Featured Stores & Restaurants — V5.1 attractive copy */}
        <View style={styles.section}>
          <SectionHeader title={FoodCopy.sections.bestStoreNearby} actionLabel="See All" onActionPress={() => onTabNavigate?.('offers')} />
          <Text style={styles.sectionSub}>{FoodCopy.sections.bestStoreSub}</Text>
          {loading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md }}>
              {vendors.map((v) => (
                <FeaturedVendorCard
                  key={v.id}
                  vendor={v}
                  onPress={() => handleVendorPress(v)}
                  onProductPress={handleProductPress}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Today's Deals — V5.1 Flash Bites style */}
        <View style={styles.section}>
          <View style={styles.dealsHeader}>
            <Text style={styles.dealsTitle}>{FoodCopy.sections.flashSale}</Text>
            <Text style={styles.dealsSubtitle}>{FoodCopy.sections.flashSaleSub}</Text>
          </View>
          {loading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md }}>
              {featuredProducts.slice(0, 6).map((p) => (
                <ProductCard key={p.id} product={p} onPress={() => handleProductPress(p)} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Promo Code Banner (V4.0 port) */}
        <Pressable style={styles.promoCodeBanner} onPress={() => router.push('/coupon')}>
          <View style={styles.promoCodeLeft}>
            <MaterialCommunityIcons name="ticket-percent" size={32} color={Colors.textInverse} />
            <View style={{ marginLeft: Spacing.md }}>
              <Text style={styles.promoCodeTitle}>Use Code: WELCOME20</Text>
              <Text style={styles.promoCodeSubtitle}>Get 20% off on your next order</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textInverse} />
        </Pressable>

        {/* Items That You Love — V5.1 Plated Just For You */}
        <View style={styles.section}>
          <SectionHeader title={FoodCopy.sections.recommendedForYou} actionLabel="See All" onActionPress={() => router.push('/popular-items')} />
          <Text style={styles.sectionSub}>{FoodCopy.sections.recommendedSub}</Text>
          {loading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md }}>
              {featuredProducts.slice(2, 8).map((p) => (
                <ProductCard key={`iyl-${p.id}`} product={p} onPress={() => handleProductPress(p)} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Top Offers Near Me — V5.1 Exclusive Kitchen Deals */}
        <View style={styles.section}>
          <SectionHeader title={FoodCopy.sections.exclusiveDeals} actionLabel="See All" onActionPress={() => router.push('/all-stores')} />
          <Text style={styles.sectionSub}>{FoodCopy.sections.exclusiveDealsSub}</Text>
          {loading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md }}>
              {vendors.filter(v => (v.discount_pct ?? 0) > 0).slice(0, 5).map((v) => (
                <FeaturedVendorCard
                  key={`top-${v.id}`}
                  vendor={v}
                  onPress={() => handleVendorPress(v)}
                  onProductPress={handleProductPress}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* New on FoodHub — V5.1 New Kitchens on FoodHub */}
        <View style={styles.section}>
          <SectionHeader title={FoodCopy.sections.newOnPlatform} actionLabel="See All" onActionPress={() => router.push('/all-stores')} />
          <Text style={styles.sectionSub}>{FoodCopy.sections.newOnPlatformSub}</Text>
          {loading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md }}>
              {[...vendors].sort((a, b) => new Date(b.created_at ?? Date.now()).getTime() - new Date(a.created_at ?? Date.now()).getTime()).slice(0, 5).map((v) => (
                <FeaturedVendorCard
                  key={`new-${v.id}`}
                  vendor={v}
                  onPress={() => handleVendorPress(v)}
                  onProductPress={handleProductPress}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Active Campaigns (V4.0 port) */}
        <View style={styles.section}>
          <SectionHeader title={FoodCopy.sections.campaigns} actionLabel="See All" onActionPress={() => router.push('/campaigns')} />
          <Text style={styles.sectionSub}>{FoodCopy.sections.campaignsSub}</Text>
          <Pressable style={styles.campaignBanner} onPress={() => router.push('/campaigns')}>
            <View style={styles.campaignLeft}>
              <MaterialCommunityIcons name="bullhorn" size={28} color={Colors.textInverse} />
              <View style={{ marginLeft: Spacing.md }}>
                <Text style={styles.campaignTitle}>Summer Sale</Text>
                <Text style={styles.campaignSubtitle}>Beat the heat with cool discounts</Text>
              </View>
            </View>
            <View style={styles.liveBadge}><Text style={styles.liveText}>LIVE</Text></View>
          </Pressable>
        </View>

        {/* ================================================================= */}
        {/* V5.1 NEW — Grocery-ported sections (Best Reviewed, Brands, Blogs, Flash Sale, Subscription, Loyalty) */}
        {/* ================================================================= */}

        {/* Best Reviewed Dishes This Week */}
        <View style={styles.section}>
          <SectionHeader title={FoodCopy.sections.bestReviewed} actionLabel="See All" onActionPress={() => router.push('/popular-items')} />
          <Text style={styles.sectionSub}>{FoodCopy.sections.bestReviewedSub}</Text>
          {loading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md, marginTop: Spacing.sm }}>
              {[...featuredProducts]
                .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
                .slice(0, 6)
                .map((p) => (
                  <ProductCard key={`br-${p.id}`} product={p} onPress={() => handleProductPress(p)} />
                ))}
            </ScrollView>
          )}
        </View>

        {/* Flash Bites Countdown (grocery flash sale pattern) */}
        <View style={styles.section}>
          <SectionHeader title={FoodCopy.sections.flashSale} actionLabel="See All" onActionPress={() => router.push('/flash-sale')} />
          <Text style={styles.sectionSub}>{FoodCopy.sections.flashSaleSub}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md, marginTop: Spacing.sm }}>
            {DEMO_FLASH_SALES.map((fs) => (
              <Pressable
                key={fs.id}
                style={styles.flashSaleCard}
                onPress={() => router.push('/flash-sale')}
              >
                <View style={styles.flashSaleHeader}>
                  <MaterialCommunityIcons name="lightning-bolt" size={18} color={Colors.surface} />
                  <Text style={styles.flashSaleTitle}>{fs.title}</Text>
                </View>
                <Text style={styles.flashSaleSubtitle} numberOfLines={2}>{fs.subtitle}</Text>
                <View style={styles.flashSaleMeta}>
                  <View style={styles.flashSaleDiscountPill}>
                    <Text style={styles.flashSaleDiscountText}>-{fs.discount_percent}%</Text>
                  </View>
                  <Text style={styles.flashSaleSoldText}>
                    {fs.sold_count}/{fs.total_stock} claimed
                  </Text>
                </View>
                <View style={styles.flashSaleProgressBar}>
                  <View style={[styles.flashSaleProgressFill, { width: `${(fs.sold_count / fs.total_stock) * 100}%` }]} />
                </View>
                <Text style={styles.flashSaleCta}>Grab Deal →</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Trusted Brands strip */}
        <View style={styles.section}>
          <SectionHeader title={FoodCopy.sections.brands} actionLabel="See All" onActionPress={() => router.push('/brands')} />
          <Text style={styles.sectionSub}>{FoodCopy.sections.brandsSub}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md, marginTop: Spacing.sm }}>
            {DEMO_FOOD_BRANDS.map((b) => (
              <Pressable
                key={b.id}
                style={styles.brandCard}
                onPress={() => router.push('/brands')}
              >
                <View style={styles.brandLogoWrap}>
                  <Text style={styles.brandEmoji}>{b.logo_url}</Text>
                </View>
                <Text style={styles.brandName} numberOfLines={1}>{b.name}</Text>
                <Text style={styles.brandCount}>{b.store_count} kitchens</Text>
                {b.is_featured && (
                  <View style={styles.brandFeaturedPill}>
                    <Text style={styles.brandFeaturedText}>★ Featured</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* FoodHub Plus Subscription Promo */}
        <Pressable style={styles.subscriptionPromoCard} onPress={() => router.push('/pro')}>
          <View style={styles.subscriptionPromoHeader}>
            <View style={styles.subscriptionPromoIconWrap}>
              <MaterialCommunityIcons name="crown" size={26} color={Colors.surface} />
            </View>
            <View style={styles.subscriptionPromoInfo}>
              <Text style={styles.subscriptionPromoTitle}>{FoodCopy.sections.subscription}</Text>
              <Text style={styles.subscriptionPromoSub}>{FoodCopy.sections.subscriptionSub}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.surface} />
          </View>
          <View style={styles.subscriptionPromoBenefits}>
            {FoodCopy.subscription.benefits.slice(0, 3).map((benefit, i) => (
              <Text key={i} style={styles.subscriptionPromoBenefit}>{benefit}</Text>
            ))}
          </View>
          <View style={styles.subscriptionPromoCtaRow}>
            <Text style={styles.subscriptionPromoPrice}>{FoodCopy.subscription.monthlyPrice}<Text style={styles.subscriptionPromoPriceUnit}>/mo</Text></Text>
            <View style={styles.subscriptionPromoCtaBtn}>
              <Text style={styles.subscriptionPromoCtaText}>{FoodCopy.subscription.cta}</Text>
            </View>
          </View>
          <Text style={styles.subscriptionPromoCancel}>{FoodCopy.subscription.cancelAnytime}</Text>
        </Pressable>

        {/* Loyalty Tier Strip */}
        <View style={styles.section}>
          <SectionHeader title={FoodCopy.loyalty.pointsBalance} actionLabel="See All" onActionPress={() => router.push('/loyalty')} />
          <Text style={styles.sectionSub}>{FoodCopy.loyalty.pointsSub}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md, marginTop: Spacing.sm }}>
            {DEMO_LOYALTY_TIERS.map((tier) => (
              <View key={tier.id} style={[styles.loyaltyTierCard, { borderColor: tier.color }]}>
                <View style={[styles.loyaltyTierIconWrap, { backgroundColor: tier.color }]}>
                  <MaterialCommunityIcons name={tier.icon as any} size={22} color={Colors.surface} />
                </View>
                <Text style={styles.loyaltyTierName}>{tier.name}</Text>
                <Text style={styles.loyaltyTierPoints}>{tier.min_points}+ pts</Text>
                <Text style={styles.loyaltyTierCashback}>{tier.cashback_percent}% cashback</Text>
                <Text style={styles.loyaltyTierPerk} numberOfLines={1}>{tier.perks[0]}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Food Journal (Blogs) */}
        <View style={styles.section}>
          <SectionHeader title={FoodCopy.sections.blogs} actionLabel="See All" onActionPress={() => router.push('/help')} />
          <Text style={styles.sectionSub}>{FoodCopy.sections.blogsSub}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md, marginTop: Spacing.sm }}>
            {DEMO_BLOG_POSTS.map((post) => (
              <Pressable
                key={post.id}
                style={styles.blogCard}
                onPress={() => router.push('/help')}
              >
                <View style={[styles.blogCover, { backgroundColor: Colors.surfaceAlt }]}>
                  <Text style={styles.blogCoverEmoji}>{post.cover_image_url}</Text>
                  <View style={styles.blogCategoryPill}>
                    <Text style={styles.blogCategoryText}>{post.category.replace('_', ' ')}</Text>
                  </View>
                </View>
                <Text style={styles.blogTitle} numberOfLines={2}>{post.title}</Text>
                <Text style={styles.blogExcerpt} numberOfLines={2}>{post.excerpt}</Text>
                <View style={styles.blogMetaRow}>
                  <MaterialCommunityIcons name="clock-outline" size={11} color={Colors.textTertiary} />
                  <Text style={styles.blogMetaText}>{post.reading_time_min} min read</Text>
                  <Text style={styles.blogMetaDot}>·</Text>
                  <Text style={styles.blogMetaText}>{post.author_name}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: Spacing.xxxl * 3 }} />
      </ScrollView>

      {/* Floating Back-to-Top button (matches design — green pill, appears on scroll) */}
      {showBackToTop && (
        <Pressable
          style={styles.backToTopBtn}
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        >
          <Ionicons name="arrow-up" size={16} color={Colors.textInverse} />
          <Text style={styles.backToTopText}>Back to Top</Text>
        </Pressable>
      )}

      {/* Floating AI Assist button (blue, with sparkle icon) */}
      <Pressable
        style={styles.aiFab}
        onPress={() => router.push('/chat')}
      >
        <MaterialCommunityIcons name="auto-fix" size={22} color={Colors.textInverse} />
      </Pressable>

      {/* All Categories bottom sheet (matches page 16 design — 4-column grid) */}
      <Modal
        visible={categoriesSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoriesSheetOpen(false)}
      >
        <Pressable style={styles.sheetOverlay} onPress={() => setCategoriesSheetOpen(false)}>
          <Pressable style={styles.sheetContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>All Categories</Text>
              <Pressable onPress={() => setCategoriesSheetOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </Pressable>
            </View>
            <View style={styles.sheetGrid}>
              {SUB_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={styles.sheetCatCard}
                  onPress={() => {
                    setCategoriesSheetOpen(false);
                    handleCategoryPress('grocery');
                  }}
                >
                  <View style={[styles.sheetCatIcon, { backgroundColor: cat.bg }]}>
                    <MaterialCommunityIcons name={cat.icon as any} size={28} color={Colors.primary} />
                  </View>
                  <Text style={styles.sheetCatName} numberOfLines={1}>{cat.label}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// --- Category Tabs ---
function CategoryTabs({ active, onChange }: { active: string; onChange: (c: any) => void }) {
  // FoodHub — only Home + Food tabs (no grocery/pharmacy/shop/parcel)
  const tabs = [
    { key: 'home', label: 'Home' },
    { key: 'food', label: 'Food' },
  ];
  return (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm }}>
        {tabs.map((t) => {
          const isActive = active === t.key;
          return (
            <Pressable key={t.key} onPress={() => onChange(t.key)} hitSlop={8}>
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {t.label}
              </Text>
              {isActive && <View style={styles.tabIndicator} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// --- Big Category Card (Grocery, Pharmacy) ---
function CategoryCardBig({ category, onPress }: { category: typeof CATEGORIES[number]; onPress: () => void }) {
  return (
    <Pressable style={[styles.catCardBig, { backgroundColor: category.bg }]} onPress={onPress}>
      <View style={styles.catCardLeft}>
        <Text style={styles.catCardTitle}>{category.label}</Text>
        <Text style={styles.catCardSubtitle}>{category.tagline}</Text>
        <View style={styles.catCardPill}>
          <MaterialCommunityIcons name="clock-outline" size={11} color={Colors.text} />
          <Text style={styles.catCardPillText}>{category.deliveryTime}</Text>
        </View>
      </View>
      <View style={styles.catCardIcon}>
        <MaterialCommunityIcons name={category.icon as any} size={48} color={category.color} />
      </View>
    </Pressable>
  );
}

// --- Small Category Card (accepts both CategoryConfig and SubCategory) ---
function CategoryCardSmall({ category, onPress }: { category: { label: string; icon: string; bg: string; color?: string }; onPress: () => void }) {
  return (
    <Pressable style={[styles.catCardSmall, { backgroundColor: category.bg }]} onPress={onPress}>
      <MaterialCommunityIcons name={category.icon as any} size={32} color={(category as any).color || Colors.primary} />
      <Text style={styles.catCardSmallTitle}>{category.label}</Text>
    </Pressable>
  );
}

// --- More Service Card (Flash Sale / Reels / Ride Share / Rental / Service) ---
function MoreServiceCard({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable style={styles.moreServiceCard} onPress={onPress}>
      <View style={[styles.moreServiceIcon, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.moreServiceLabel} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

// --- Promo Banner (Are You Hungry? / Heavy Rain?) ---
function PromoBanner({ title, subtitle, icon, bg }: { title: string; subtitle: string; icon: string; bg: string }) {
  return (
    <View style={[styles.promoBanner, { backgroundColor: bg }]}>
      <View style={styles.promoBannerLeft}>
        <Text style={styles.promoBannerTitle}>{title}</Text>
        <Text style={styles.promoBannerSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.promoBannerIcon}>{icon}</Text>
    </View>
  );
}

// --- Hero Carousel ---
function HeroCarousel() {
  return (
    <View style={styles.heroCarousel}>
      <View style={styles.heroCard}>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitle}>Essentials for a Clean Home</Text>
          <Text style={styles.heroSubtitle}>
            All your home cleaning and organization needs in one place.
          </Text>
        </View>
        <MaterialCommunityIcons name="spray-bottle" size={56} color={Colors.primaryDark} />
      </View>
      <View style={styles.dots}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

// --- Featured Vendor Card (with image, AD badge, discount) ---
function FeaturedVendorCard({
  vendor,
  onPress,
  onProductPress,
}: {
  vendor: Vendor;
  onPress: () => void;
  onProductPress?: (p: Product) => void;
}) {
  const { isVendorFavorite, toggleVendor } = useFavorites();
  const fav = isVendorFavorite(vendor.id);
  return (
    <Pressable style={styles.featuredCard} onPress={onPress}>
      <View style={[styles.featuredBanner, { backgroundColor: (vendor.category ?? 'grocery') === 'food' ? Colors.catOrange : (vendor.category ?? 'grocery') === 'pharmacy' ? Colors.catMint : (vendor.category ?? 'grocery') === 'shop' ? Colors.catPink : Colors.catYellow }]}>
        <FavoriteButton active={fav} onPress={() => toggleVendor(vendor)} style={styles.featuredFav} />
        <MaterialCommunityIcons
          name={categoryToIcon((vendor.category ?? 'grocery')) as any}
          size={56}
          color={Colors.primaryDark}
          style={styles.featuredIcon}
        />
        {vendor.is_promoted && <AdBadge />}
        <Text style={styles.featuredBannerText}>{vendor.tagline}</Text>
      </View>
      <View style={styles.featuredInfo}>
        <View style={styles.featuredNameRow}>
          {vendor.verified && (
            <View style={styles.verifiedCircle}>
              <Ionicons name="checkmark" size={10} color="white" />
            </View>
          )}
          <Text style={styles.featuredName} numberOfLines={1}>{vendor.name}</Text>
        </View>
        <View style={styles.featuredMetaRow}>
          <Rating value={vendor.rating} count={vendor.rating_count} size="sm" />
          <Text style={styles.metaDot}>·</Text>
          <DeliveryTimePill
            minutes={`${vendor.delivery_time_min}-${vendor.delivery_time_max} min`}
            distanceKm={vendor.distance_km}
          />
          {(vendor.discount_pct ?? 0) > 0 && <DiscountBadge percent={vendor.discount_pct ?? 0} />}
        </View>
      </View>
    </Pressable>
  );
}

function categoryToIcon(c: CategoryKey): string {
  switch (c) {
    case 'grocery': return 'cart-variant';
    case 'pharmacy': return 'medical-bag';
    case 'shop': return 'shopping-outline';
    case 'food': return 'food-apple-outline';
    case 'parcel': return 'package-variant-closed';
    default: return "";
  }
}

// --- Product Card ---
function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  const router = useRouter();
  const { addItem, addItemLegacy } = useCart();
  const { isProductFavorite, toggleProduct } = useFavorites();
  const fav = isProductFavorite(product.id);

  return (
    <View style={styles.productCard}>
      <View style={styles.productImageWrap}>
        <Pressable onPress={onPress} style={styles.productImagePress}>
          {product.image_url ? (
            <Image source={{ uri: getItemImageUrl(product) ?? undefined }} style={styles.productImage} resizeMode="contain" />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <MaterialCommunityIcons name="image-outline" size={36} color={Colors.textTertiary} />
            </View>
          )}
        </Pressable>
        <FavoriteButton active={fav} onPress={() => toggleProduct(product)} style={styles.productFav} />
        <AddButton onPress={() => addItemLegacy(product)} style={styles.productAdd} />
      </View>
      <Pressable onPress={onPress}>
        <Text style={styles.productVendor} numberOfLines={1}>
          {vendorName(product)}
        </Text>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.productPriceRow}>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          {(product.original_price ?? null) && (
            <Text style={styles.productOriginal}>${(product.original_price ?? 0).toFixed(2)}</Text>
          )}
        </View>
        {(product.discount_pct ?? 0) > 0 && (
          <View style={styles.productDiscountRow}>
            <DiscountBadge percent={product.discount_pct ?? 0} />
          </View>
        )}
      </Pressable>
    </View>
  );
}

function vendorName(p: Product): string {
  // Lookup from demo data is cheap
  const v = require('@/data/demo-data').DEMO_VENDORS.find((v: Vendor) => v.id === p.vendor_id);
  return v?.name ?? '';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  locationLeft: {
    flex: 1,
  },
  deliverToLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  deliverToAddress: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    maxWidth: 220,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  tabsContainer: {
    paddingVertical: Spacing.xs,
  },
  tabText: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
  },
  tabTextActive: {
    color: Colors.text,
    fontWeight: FontWeight.bold,
  },
  tabIndicator: {
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
  },
  searchPlaceholder: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  searchTerm: {
    color: Colors.text,
    fontWeight: FontWeight.semibold,
  },
  categoryCardsWrap: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  catCardBig: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    minHeight: 110,
  },
  catCardLeft: {
    flex: 1,
  },
  catCardTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  catCardSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    maxWidth: 180,
  },
  catCardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  catCardPillText: {
    fontSize: FontSize.xs,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },
  catCardIcon: {
    padding: Spacing.md,
  },
  categorySmallRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  catCardSmall: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    minHeight: 90,
    gap: Spacing.sm,
  },
  moreServicesWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.md,
  },
  moreServiceCard: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: Spacing.xs,
  },
  moreServiceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  moreServiceLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  catCardSmallTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  seeMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
  },
  seeMoreText: {
    fontSize: FontSize.sm,
    color: Colors.info,
    fontWeight: FontWeight.medium,
  },
  bannersWrap: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
  },
  promoBannerLeft: {
    flex: 1,
  },
  promoBannerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  promoBannerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  promoBannerIcon: {
    fontSize: 36,
  },
  heroCarousel: {
    marginTop: Spacing.xl,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.catBlue,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    minHeight: 130,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primaryDark,
  },
  heroSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.text,
    width: 18,
  },
  section: {
    marginTop: Spacing.xl,
  },
  dealsHeader: {
    backgroundColor: Colors.catYellow,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  dealsTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#B45309',
  },
  dealsSubtitle: {
    fontSize: FontSize.xs,
    color: '#B45309',
    marginTop: 2,
  },
  featuredCard: {
    width: 260,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  featuredBanner: {
    height: 130,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  featuredFav: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    zIndex: 2,
  },
  featuredIcon: {
    marginBottom: Spacing.xs,
  },
  featuredBannerText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primaryDark,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  featuredInfo: {
    padding: Spacing.md,
  },
  featuredNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  verifiedCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.info,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    flex: 1,
  },
  featuredMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  metaDot: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
  },
  productCard: {
    width: 150,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  productImageWrap: {
    position: 'relative',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    height: 120,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productImagePress: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '90%',
    height: '90%',
  },
  productImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productFav: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  productAdd: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  productVendor: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  productName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    minHeight: 36,
    marginBottom: 4,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  productPrice: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  productOriginal: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  productDiscountRow: {
    marginTop: 4,
  },
  backToTopBtn: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  backToTopText: {
    color: Colors.textInverse,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  aiFab: {
    position: 'absolute',
    bottom: 100,
    right: Spacing.lg,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.info,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  sheetTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  sheetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sheetCatCard: {
    width: '23%',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sheetCatIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  sheetCatName: {
    fontSize: FontSize.xs,
    color: Colors.text,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  // V4.0 new home sections
  promoCodeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  promoCodeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  promoCodeTitle: {
    color: Colors.textInverse,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  promoCodeSubtitle: {
    color: Colors.textInverse,
    opacity: 0.85,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  campaignBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.warning,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  campaignLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  campaignTitle: {
    color: Colors.textInverse,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  campaignSubtitle: {
    color: Colors.textInverse,
    opacity: 0.85,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  liveBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveText: {
    color: Colors.textInverse,
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },

  // =========================== V5.1 NEW styles ===========================
  sectionSub: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
    marginTop: -Spacing.sm,
  },

  // Flash sale card
  flashSaleCard: {
    width: 240,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  flashSaleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xs,
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  flashSaleTitle: {
    color: Colors.surface,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  flashSaleSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 16,
  },
  flashSaleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  flashSaleDiscountPill: {
    backgroundColor: Colors.dangerBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.xs,
  },
  flashSaleDiscountText: {
    color: Colors.danger,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  flashSaleSoldText: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  flashSaleProgressBar: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  flashSaleProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  flashSaleCta: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },

  // Brand card
  brandCard: {
    width: 110,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  brandLogoWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  brandEmoji: {
    fontSize: 32,
  },
  brandName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  brandCount: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  brandFeaturedPill: {
    marginTop: 4,
    backgroundColor: `${Colors.warning}1A`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  brandFeaturedText: {
    fontSize: 9,
    color: Colors.warning,
    fontWeight: FontWeight.bold,
  },

  // Subscription promo
  subscriptionPromoCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  subscriptionPromoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  subscriptionPromoIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionPromoInfo: {
    flex: 1,
  },
  subscriptionPromoTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.surface,
  },
  subscriptionPromoSub: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  subscriptionPromoBenefits: {
    gap: 6,
    marginBottom: Spacing.md,
  },
  subscriptionPromoBenefit: {
    fontSize: FontSize.xs,
    color: Colors.surface,
    opacity: 0.95,
  },
  subscriptionPromoCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subscriptionPromoPrice: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.surface,
  },
  subscriptionPromoPriceUnit: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    opacity: 0.85,
  },
  subscriptionPromoCtaBtn: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  subscriptionPromoCtaText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  subscriptionPromoCancel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // Loyalty tier strip
  loyaltyTierCard: {
    width: 140,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  loyaltyTierIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  loyaltyTierName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  loyaltyTierPoints: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  loyaltyTierCashback: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.success,
    marginTop: 2,
  },
  loyaltyTierPerk: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 4,
    textAlign: 'center',
  },

  // Blog card
  blogCard: {
    width: 240,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  blogCover: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  blogCoverEmoji: {
    fontSize: 48,
  },
  blogCategoryPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  blogCategoryText: {
    color: Colors.surface,
    fontSize: 9,
    fontWeight: FontWeight.bold,
    textTransform: 'capitalize',
  },
  blogTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    lineHeight: 18,
  },
  blogExcerpt: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
    paddingTop: 4,
    lineHeight: 15,
  },
  blogMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  blogMetaText: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  blogMetaDot: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
});

