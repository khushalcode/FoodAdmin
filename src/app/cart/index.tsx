// Cart screen — shows cart items, quantities, subtotal, delivery fee, total.
// Uses V4.0 cart store (cartGroups, vendor-grouped).

import { StyleSheet, View, Text, Pressable, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, EmptyState } from '@/components/ui/index';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/cart';
import { getItemImageUrl } from '@/types';

export default function CartScreen() {
  const router = useRouter();
  const { cartGroups, subtotal, totalDiscount, deliveryFee, grandTotal, count, updateQuantity, clear } = useCart();

  const handleCheckout = () => {
    if (count === 0) return;
    router.push('/checkout');
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>My Cart ({count})</Text>
        <Pressable onPress={clear} hitSlop={8}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
      </View>

      {count === 0 ? (
        <EmptyState
          icon="cart-outline"
          title="Your cart is empty"
          subtitle="Browse our marketplace and add some products to your cart."
        />
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {cartGroups.map((group) => {
              return (
                <View key={group.store_id} style={styles.vendorGroup}>
                  <Pressable
                    style={styles.vendorHeader}
                    onPress={() => router.push(`/vendor/${group.store_id}`)}
                  >
                    <View style={styles.vendorLogo}>
                      <MaterialCommunityIcons name="store" size={16} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.vendorName} numberOfLines={1}>{group.store_name || 'Store'}</Text>
                      <Text style={styles.vendorMeta}>
                        {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                  </Pressable>

                  {group.items.map((item) => {
                    const img = getItemImageUrl(item.product);
                    return (
                      <View key={item.id} style={styles.cartItem}>
                        <Pressable
                          onPress={() => router.push(`/product/${item.product_id}`)}
                          style={styles.itemImageWrap}
                        >
                          {img ? (
                            <Image source={{ uri: img }} style={styles.itemImage} resizeMode="contain" />
                          ) : (
                            <View style={styles.itemImagePlaceholder}>
                              <MaterialCommunityIcons name="image-outline" size={24} color={Colors.textTertiary} />
                            </View>
                          )}
                        </Pressable>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
                          <Text style={styles.itemUnit}>{item.product.unit}</Text>
                          {item.variation_label && (
                            <Text style={styles.itemUnit}>{item.variation_label}</Text>
                          )}
                          {item.add_on_names.length > 0 && (
                            <Text style={styles.itemUnit}>Add-ons: {item.add_on_names.join(', ')}</Text>
                          )}
                          <Text style={styles.itemPrice}>${item.unit_price.toFixed(2)}</Text>
                        </View>
                        <View style={styles.qtyControl}>
                          <Pressable
                            style={styles.qtyBtn}
                            onPress={() => updateQuantity(item.id, item.quantity - 1)}
                            hitSlop={8}
                          >
                            <Ionicons name="remove" size={16} color={Colors.text} />
                          </Pressable>
                          <Text style={styles.qtyValue}>{item.quantity}</Text>
                          <Pressable
                            style={styles.qtyBtn}
                            onPress={() => updateQuantity(item.id, item.quantity + 1)}
                            hitSlop={8}
                          >
                            <Ionicons name="add" size={16} color={Colors.text} />
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}

                  <View style={styles.vendorFooter}>
                    <Text style={styles.vendorSubtotalLabel}>Subtotal</Text>
                    <Text style={styles.vendorSubtotalValue}>${group.subtotal.toFixed(2)}</Text>
                  </View>
                </View>
              );
            })}

            {/* Bill details */}
            <View style={styles.billCard}>
              <Text style={styles.billTitle}>Bill Details</Text>
              <BillRow label={`Item Total (${count} ${count === 1 ? 'item' : 'items'})`} value={`$${subtotal.toFixed(2)}`} />
              <BillRow
                label="Delivery Fee"
                value={deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                valueStyle={deliveryFee === 0 ? { color: Colors.success } : undefined}
              />
              {totalDiscount > 0 && (
                <BillRow
                  label="Discount"
                  value={`-$${totalDiscount.toFixed(2)}`}
                  valueStyle={{ color: Colors.success }}
                />
              )}
              <View style={styles.billDivider} />
              <BillRow
                label="To Pay"
                value={`$${grandTotal.toFixed(2)}`}
                bold
              />
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>

          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.bottomTotalLabel}>Total</Text>
              <Text style={styles.bottomTotal}>${grandTotal.toFixed(2)}</Text>
            </View>
            <Button
              label="Proceed to Checkout"
              icon="arrow-forward"
              iconPosition="right"
              size="lg"
              onPress={handleCheckout}
              style={{ flex: 1, marginLeft: Spacing.lg }}
            />
          </View>
        </>
      )}
    </View>
  );
}

function BillRow({
  label,
  value,
  bold,
  valueStyle,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueStyle?: any;
}) {
  return (
    <View style={styles.billRow}>
      <Text style={[styles.billRowLabel, bold && styles.billRowLabelBold]}>{label}</Text>
      <Text style={[styles.billRowValue, bold && styles.billRowValueBold, valueStyle]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  clearText: { fontSize: FontSize.sm, color: Colors.danger, fontWeight: FontWeight.medium },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  vendorGroup: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: Spacing.md,
  },
  vendorLogo: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  vendorMeta: { fontSize: FontSize.xs, color: Colors.textSecondary },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  itemImageWrap: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemImage: { width: '85%', height: '85%' },
  itemImagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: 2 },
  itemUnit: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 2 },
  itemPrice: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, minWidth: 20, textAlign: 'center' },
  vendorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: Spacing.xs,
  },
  vendorSubtotalLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  vendorSubtotalValue: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.bold },
  billCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  billTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  billRowLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  billRowLabelBold: { color: Colors.text, fontWeight: FontWeight.bold, fontSize: FontSize.md },
  billRowValue: { fontSize: FontSize.sm, color: Colors.text },
  billRowValueBold: { color: Colors.text, fontWeight: FontWeight.bold, fontSize: FontSize.md },
  billDivider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.sm },
  bottomBar: {
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
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomTotalLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  bottomTotal: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
});
