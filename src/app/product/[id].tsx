// ============================================================================
// Product detail screen — V5.1 Enhanced with grocery-ported food features
// ----------------------------------------------------------------------------
// Original V5.0 structure is preserved. New sections (allergens, nutrition,
// dietary tags, bulk discount, restock notify, subscription promo, ingredients)
// are inserted between the description and the "You might also like" section.
// All copy is sourced from src/constants/food_copy.ts — food-focused, no
// grocery terminology.
// ============================================================================

import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, DiscountBadge, Rating, VerifiedBadge, DeliveryTimePill, SectionHeader } from '@/components/ui/index';
import { Button } from '@/components/ui/button';
import { fetchProductById, fetchVendorById, fetchProducts } from '@/lib/data';
import { useCart } from '@/store/cart';
import { useFavorites } from '@/store/favorites';
import type { Product, Vendor } from '@/types'; import { getItemImageUrl } from '@/types';
import { FoodCopy, fill } from '@/constants/food_copy';
import {
  DEMO_NUTRITION,
  DEMO_ALLERGENS,
  DEMO_INGREDIENTS,
  DEMO_BULK_TIERS,
} from '@/data/food_features_demo';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addItem, addItemLegacy, getQuantity, updateQuantity, isInCart } = useCart();
  const { isProductFavorite, toggleProduct } = useFavorites();
  const [product, setProduct] = useState<Product | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [restockRequested, setRestockRequested] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      const p = await fetchProductById(id);
      if (!p) {
        if (mounted) setLoading(false);
        return;
      }
      setProduct(p);
      const v = await fetchVendorById(p.store_id ?? p.vendor_id);
      const r = await fetchProducts({ category: p.category, limit: 6 });
      if (mounted) {
        setVendor(v);
        setRelated(r.filter((x) => x.id !== p.id).slice(0, 4));
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <StatusBar />
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Product</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: Colors.textSecondary }}>Product not found.</Text>
        </View>
      </View>
    );
  }

  const qty = getQuantity(product.id);
  const fav = isProductFavorite(product.id);
  const productIdNum = Number(product.id) || 0;
  const nutrition = DEMO_NUTRITION[productIdNum];
  const allergens = DEMO_ALLERGENS[productIdNum] ?? [];
  const ingredients = DEMO_INGREDIENTS[productIdNum] ?? [];
  const bulkTiers = DEMO_BULK_TIERS;
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  // Determine applicable bulk tier based on qty
  const applicableTier = [...bulkTiers].reverse().find((t) => qty >= t.min_qty) || null;
  const nextTier = bulkTiers.find((t) => qty < t.min_qty) || null;
  const bulkSavings = applicableTier ? (product.price * qty * applicableTier.percent) / 100 : 0;

  const handleAdd = () => {
    if (isInCart(product.id)) {
      updateQuantity(product.id, qty + 1);
    } else {
      addItemLegacy(product);
    }
  };

  const handleDecrement = () => {
    updateQuantity(product.id, qty - 1);
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Product Details</Text>
        <Pressable onPress={() => router.push('/cart')} hitSlop={8}>
          <Ionicons name="cart-outline" size={22} color={Colors.text} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero image */}
        <View style={styles.heroImageWrap}>
          {product.image_url ? (
            <Image source={{ uri: getItemImageUrl(product) ?? undefined }} style={styles.heroImage} resizeMode="contain" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <MaterialCommunityIcons name="image-outline" size={80} color={Colors.textTertiary} />
            </View>
          )}
          <Pressable style={styles.favBtn} onPress={() => toggleProduct(product)} hitSlop={8}>
            <Ionicons name={fav ? 'heart' : 'heart-outline'} size={22} color={fav ? Colors.danger : Colors.text} />
          </Pressable>
          {(product.discount_pct ?? 0) > 0 && (
            <View style={styles.discountPill}>
              <DiscountBadge percent={product.discount_pct ?? 0} />
            </View>
          )}
          {/* Dietary tag strip — NEW V5.1 */}
          <View style={styles.tagStrip}>
            {product.is_veg && <DietaryTag label="Veg"     color={Colors.success}   icon="leaf" />}
            {product.is_non_veg && <DietaryTag label="Non-Veg" color={Colors.danger}   icon="drumstick-outline" />}
            {product.is_halal && <DietaryTag label="Halal"   color={Colors.success}   icon="check-decagram" />}
            {product.is_organic && <DietaryTag label="Organic" color={Colors.success}   icon="sprout" />}
            {product.is_gluten_free && <DietaryTag label="GF"      color={Colors.warning}   icon="barley-off" />}
            {product.is_spicy && <DietaryTag label="Spicy"   color={Colors.danger}   icon="fire" />}
            {product.is_chef_special && <DietaryTag label="Chef's Pick" color={Colors.primary} icon="chef-hat" />}
            {product.is_best_seller && <DietaryTag label="Best Seller" color={Colors.warning} icon="trophy" />}
            {product.is_new && <DietaryTag label="New" color={Colors.info} icon="sparkles" />}
          </View>
        </View>

        {/* Product info */}
        <View style={styles.infoSection}>
          {vendor && (
            <Pressable
              style={styles.vendorChip}
              onPress={() => router.push(`/vendor/${vendor.id}`)}
            >
              <View style={styles.vendorLogo}>
                <MaterialCommunityIcons
                  name={iconForCategory((vendor.category ?? 'grocery') as any) as any}
                  size={14}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.vendorInfo}>
                <Text style={styles.vendorName} numberOfLines={1}>
                  {vendor.name}
                  {vendor.verified && <Text> ✓</Text>}
                </Text>
                <DeliveryTimePill
                  minutes={formatDeliveryTime(vendor)}
                  distanceKm={vendor.distance_km}
                />
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </Pressable>
          )}

          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.metaRow}>
            <Rating value={product.rating} count={product.rating_count} />
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.unit}>{product.unit}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.unit}>{product.order_count}+ ordered</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {(product.original_price ?? null) && (
              <Text style={styles.originalPrice}>${(product.original_price ?? 0).toFixed(2)}</Text>
            )}
            {(product.discount_pct ?? 0) > 0 && (
              <Text style={styles.savingsText}>
                Save ${((product.original_price ?? null)! - product.price).toFixed(2)}
              </Text>
            )}
          </View>

          {/* ---- NEW V5.1: Bulk order discount banner ---- */}
          {bulkTiers.length > 0 && !isOutOfStock && (
            <View style={styles.bulkBanner}>
              <View style={styles.bulkHeader}>
                <MaterialCommunityIcons name="tag-multiple" size={18} color={Colors.primary} />
                <Text style={styles.bulkTitle}>{FoodCopy.dish.bulkTitle}</Text>
              </View>
              <Text style={styles.bulkSub}>{FoodCopy.dish.bulkSub}</Text>
              <View style={styles.bulkTiersRow}>
                {bulkTiers.map((t) => {
                  const unlocked = qty >= t.min_qty;
                  return (
                    <View
                      key={t.min_qty}
                      style={[styles.bulkTierPill, unlocked && styles.bulkTierPillActive]}
                    >
                      <Text style={[styles.bulkTierLabel, unlocked && styles.bulkTierLabelActive]}>
                        {t.label ?? `${t.min_qty}+ · ${t.percent}%`}
                      </Text>
                    </View>
                  );
                })}
              </View>
              {applicableTier ? (
                <Text style={styles.bulkUnlocked}>
                  {fill('🎉 Bulk discount unlocked! You saved ${amount}', { amount: bulkSavings.toFixed(2) })}
                </Text>
              ) : nextTier ? (
                <Text style={styles.bulkProgress}>
                  {fill('Add {remaining} more portions to unlock {percent}% off', {
                    remaining: nextTier.min_qty - qty,
                    percent: nextTier.percent,
                  })}
                </Text>
              ) : null}
            </View>
          )}

          {product.description && (
            <View style={styles.descSection}>
              <Text style={styles.descTitle}>Description</Text>
              <Text style={styles.descText}>{product.description}</Text>
            </View>
          )}

          {/* ---- NEW V5.1: Ingredients list ---- */}
          {ingredients.length > 0 && (
            <View style={styles.descSection}>
              <Text style={styles.descTitle}>{FoodCopy.dish.ingredientsTitle}</Text>
              <Text style={styles.descSub}>{FoodCopy.dish.ingredientsSub}</Text>
              <View style={styles.ingredientsWrap}>
                {ingredients.map((ing, i) => (
                  <View key={i} style={styles.ingredientChip}>
                    <MaterialCommunityIcons name="circle-medium" size={10} color={Colors.primary} />
                    <Text style={styles.ingredientText}>{ing}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ---- NEW V5.1: Allergen warning ---- */}
          {allergens.length > 0 && (
            <View style={styles.allergenSection}>
              <View style={styles.allergenHeader}>
                <MaterialCommunityIcons name="alert-circle-outline" size={20} color={Colors.warning} />
                <Text style={styles.allergenTitle}>{FoodCopy.dish.allergenTitle}</Text>
              </View>
              <Text style={styles.allergenSub}>{FoodCopy.dish.allergenSub}</Text>
              <View style={styles.allergenChipsRow}>
                {allergens.map((a) => (
                  <View key={a} style={styles.allergenChip}>
                    <Text style={styles.allergenChipText}>{allergenLabel(a)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ---- NEW V5.1: Nutrition facts ---- */}
          {nutrition && (
            <View style={styles.descSection}>
              <Text style={styles.descTitle}>{FoodCopy.dish.nutritionTitle}</Text>
              <Text style={styles.descSub}>
                {FoodCopy.dish.nutritionSub}
                {nutrition.serving_size ? ` · ${nutrition.serving_size}` : ''}
              </Text>
              <View style={styles.nutritionGrid}>
                <NutritionCell label="Calories"   value={`${nutrition.calories}`} unit="kcal"  highlight />
                <NutritionCell label="Protein"    value={nutrition.protein_g != null ? `${nutrition.protein_g}` : '—'} unit="g" />
                <NutritionCell label="Carbs"      value={nutrition.carbs_g != null ? `${nutrition.carbs_g}` : '—'} unit="g" />
                <NutritionCell label="Fat"        value={nutrition.fat_g != null ? `${nutrition.fat_g}` : '—'} unit="g" />
                <NutritionCell label="Fiber"      value={nutrition.fiber_g != null ? `${nutrition.fiber_g}` : '—'} unit="g" />
                <NutritionCell label="Sugar"      value={nutrition.sugar_g != null ? `${nutrition.sugar_g}` : '—'} unit="g" />
                <NutritionCell label="Sodium"     value={nutrition.sodium_mg != null ? `${nutrition.sodium_mg}` : '—'} unit="mg" />
              </View>
            </View>
          )}

          {/* ---- NEW V5.1: Subscription promo ---- */}
          {product.subscription_eligible !== false && !isOutOfStock && (
            <Pressable style={styles.subscriptionBanner} onPress={() => setSubscriptionOpen((v) => !v)}>
              <View style={styles.subscriptionIconWrap}>
                <MaterialCommunityIcons name="calendar-sync" size={22} color={Colors.surface} />
              </View>
              <View style={styles.subscriptionInfo}>
                <Text style={styles.subscriptionTitle}>{FoodCopy.vendor.subscriptionTitle}</Text>
                <Text style={styles.subscriptionSub}>{FoodCopy.vendor.subscriptionSub}</Text>
              </View>
              <MaterialCommunityIcons name={subscriptionOpen ? 'chevron-up' : 'chevron-right'} size={20} color={Colors.primary} />
            </Pressable>
          )}

          {/* ---- NEW V5.1: Out-of-stock → restock notify ---- */}
          {isOutOfStock && (
            <View style={styles.restockSection}>
              <View style={styles.restockHeader}>
                <MaterialCommunityIcons name="package-variant" size={28} color={Colors.danger} />
                <View>
                  <Text style={styles.restockTitle}>{FoodCopy.dish.stockOut}</Text>
                  <Text style={styles.restockSub}>{FoodCopy.dish.restockSub}</Text>
                </View>
              </View>
              <Button
                label={restockRequested ? '✓ You’ll be notified' : FoodCopy.dish.restockCta}
                variant={restockRequested ? 'dark' : 'primary'}
                block
                size="md"
                onPress={() => setRestockRequested(true)}
              />
            </View>
          )}

          {/* ---- NEW V5.1: Special instructions for the chef ---- */}
          {!isOutOfStock && (
            <View style={styles.descSection}>
              <Text style={styles.descTitle}>{FoodCopy.dish.noteTitle}</Text>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder={FoodCopy.dish.notePlaceholder}
                placeholderTextColor={Colors.textTertiary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          )}

          {/* Related products */}
          {related.length > 0 && (
            <View style={styles.relatedSection}>
              <SectionHeader title={FoodCopy.dish.relatedTitle} />
              <Text style={styles.relatedSub}>{FoodCopy.dish.relatedSub}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md, marginTop: Spacing.md }}>
                {related.map((p) => (
                  <Pressable
                    key={p.id}
                    style={styles.relatedCard}
                    onPress={() => router.push(`/product/${p.id}`)}
                  >
                    <View style={styles.relatedImageWrap}>
                      {p.image_url ? (
                        <Image source={{ uri: getItemImageUrl(p) ?? undefined }} style={styles.relatedImage} resizeMode="contain" />
                      ) : (
                        <View style={styles.relatedPlaceholder}>
                          <MaterialCommunityIcons name="image-outline" size={24} color={Colors.textTertiary} />
                        </View>
                      )}
                    </View>
                    <Text style={styles.relatedName} numberOfLines={2}>{p.name}</Text>
                    <Text style={styles.relatedPrice}>${p.price.toFixed(2)}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Sticky bottom action bar */}
      {!isOutOfStock && (
        <View style={styles.actionBar}>
          {qty > 0 ? (
            <View style={styles.qtyControl}>
              <Pressable style={styles.qtyBtn} onPress={handleDecrement} hitSlop={8}>
                <Ionicons name="remove" size={18} color={Colors.text} />
              </Pressable>
              <Text style={styles.qtyValue}>{qty}</Text>
              <Pressable style={styles.qtyBtn} onPress={handleAdd} hitSlop={8}>
                <Ionicons name="add" size={18} color={Colors.text} />
              </Pressable>
            </View>
          ) : (
            <Button
              label={FoodCopy.cta.addToCart}
              icon="cart-outline"
              block
              size="lg"
              onPress={handleAdd}
            />
          )}
          <View style={{ width: Spacing.md }} />
          <Button
            label={FoodCopy.cta.buyNow}
            variant="dark"
            icon="bag-check-outline"
            block
            size="lg"
            onPress={() => {
              if (qty === 0) handleAdd();
              router.push('/cart');
            }}
          />
        </View>
      )}
    </View>
  );
}

// ============================================================================
// NEW V5.1 — Sub-components for grocery-ported features
// ============================================================================

function DietaryTag({ label, color, icon }: { label: string; color: string; icon: string }) {
  return (
    <View style={[styles.dietaryTag, { backgroundColor: `${color}1A`, borderColor: `${color}40` }]}>
      <MaterialCommunityIcons name={icon as any} size={11} color={color} />
      <Text style={[styles.dietaryTagText, { color }]}>{label}</Text>
    </View>
  );
}

function NutritionCell({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.nutritionCell, highlight && styles.nutritionCellHighlight]}>
      <Text style={[styles.nutritionValue, highlight && styles.nutritionValueHighlight]}>{value}</Text>
      <Text style={styles.nutritionUnit}>{unit}</Text>
      <Text style={styles.nutritionLabel}>{label}</Text>
    </View>
  );
}

function allergenLabel(key: string): string {
  const map: Record<string, string> = {
    gluten: 'Gluten',
    dairy: 'Dairy',
    peanuts: 'Peanuts',
    tree_nuts: 'Tree Nuts',
    soy: 'Soy',
    eggs: 'Eggs',
    fish: 'Fish',
    shellfish: 'Shellfish',
    sesame: 'Sesame',
    mustard: 'Mustard',
    celery: 'Celery',
    sulphites: 'Sulphites',
    lupin: 'Lupin',
  };
  return map[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

// --- helpers retained from V5.0 ---
import { TextInput } from 'react-native';

function iconForCategory(c: string): string {
  switch (c) {
    case 'grocery': return 'cart-variant';
    case 'pharmacy': return 'medical-bag';
    case 'shop': return 'shopping-outline';
    case 'food': return 'food-apple-outline';
    case 'parcel': return 'package-variant-closed';
    default: return 'store-outline';
  }
}

function formatDeliveryTime(v: Vendor): string {
  if (v.delivery_time_min >= 60) {
    return `${Math.round(v.delivery_time_min / 60)}-${Math.round(v.delivery_time_max / 60)} hours`;
  }
  return `${v.delivery_time_min}-${v.delivery_time_max} min`;
}

// ============================================================================
// Styles — V5.0 styles preserved + new V5.1 grocery-feature styles appended
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  scrollContent: {},
  heroImageWrap: {
    position: 'relative',
    backgroundColor: Colors.surfaceAlt,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '80%',
    height: '80%',
  },
  heroPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountPill: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
  },
  // ---- NEW V5.1: Dietary tag strip ----
  tagStrip: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  dietaryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  dietaryTagText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  infoSection: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    marginTop: -Spacing.xl,
  },
  vendorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  vendorLogo: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  productName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  metaDot: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
  },
  unit: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  price: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  originalPrice: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  savingsText: {
    fontSize: FontSize.sm,
    color: Colors.success,
    fontWeight: FontWeight.semibold,
  },

  // ---- NEW V5.1: Bulk discount banner ----
  bulkBanner: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  bulkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  bulkTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  bulkSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  bulkTiersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  bulkTierPill: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bulkTierPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bulkTierLabel: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  bulkTierLabelActive: {
    color: Colors.surface,
  },
  bulkUnlocked: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.success,
    marginTop: 4,
  },
  bulkProgress: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  descSection: {
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  descTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  descSub: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
  },
  descText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // ---- NEW V5.1: Ingredients chips ----
  ingredientsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.xs,
  },
  ingredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ingredientText: {
    fontSize: FontSize.xs,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },

  // ---- NEW V5.1: Allergen section ----
  allergenSection: {
    backgroundColor: `${Colors.warning}1A`,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  allergenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  allergenTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.warning,
  },
  allergenSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  allergenChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  allergenChip: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: `${Colors.warning}40`,
  },
  allergenChipText: {
    fontSize: FontSize.xs,
    color: Colors.warning,
    fontWeight: FontWeight.semibold,
  },

  // ---- NEW V5.1: Nutrition grid ----
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.sm,
  },
  nutritionCell: {
    width: '23%',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  nutritionCellHighlight: {
    backgroundColor: Colors.primaryLight,
  },
  nutritionValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  nutritionValueHighlight: {
    color: Colors.primary,
  },
  nutritionUnit: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  nutritionLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // ---- NEW V5.1: Subscription promo ----
  subscriptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  subscriptionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.surface,
  },
  subscriptionSub: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.85)',
  },

  // ---- NEW V5.1: Restock notify ----
  restockSection: {
    backgroundColor: `${Colors.danger}0D`,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: `${Colors.danger}33`,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  restockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  restockTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.danger,
  },
  restockSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // ---- NEW V5.1: Chef note input ----
  noteInput: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.text,
    minHeight: 70,
    marginTop: Spacing.xs,
  },

  relatedSection: {
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  relatedSub: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  relatedCard: {
    width: 130,
  },
  relatedImageWrap: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  relatedImage: {
    width: '80%',
    height: '80%',
  },
  relatedPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  relatedName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    minHeight: 32,
  },
  relatedPrice: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginTop: 2,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  qtyControl: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
});
