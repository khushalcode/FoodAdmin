// Order detail screen — shows order info, items, status timeline.

import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, EmptyState } from '@/components/ui/index';
import { useOrders } from '@/store/orders';
import type { Order, OrderStatus } from '@/types'; import { getItemImageUrl } from '@/types';

const TIMELINE: { status: OrderStatus; label: string; icon: any }[] = [
  { status: 'placed', label: 'Order Placed', icon: 'clipboard-check-outline' },
  { status: 'confirmed', label: 'Order Confirmed', icon: 'check-decagram-outline' },
  { status: 'preparing', label: 'Preparing', icon: 'pot-steam-outline' },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: 'moped' },
  { status: 'delivered', label: 'Delivered', icon: 'package-check' },
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { orders } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const o = orders.find((x) => String(x.id) === String(id)) ?? null;
    setOrder(o);
  }, [id, orders]);

  if (!order) {
    return (
      <View style={styles.container}>
        <StatusBar />
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 38 }} />
        </View>
        <EmptyState icon="clipboard-text-outline" title="Order not found" />
      </View>
    );
  }

  const currentStatusIdx = TIMELINE.findIndex((t) => t.status === order.status);

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Order #{String(order.id).slice(-6)}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Vendor info */}
        <View style={styles.vendorCard}>
          <View style={styles.vendorLogo}>
            <MaterialCommunityIcons name="store" size={20} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.vendorName}>{order.vendor_name}</Text>
            <Text style={styles.orderDate}>
              {new Date(order.created_at).toLocaleString('en-US', {
                day: 'numeric',
                month: 'short',
                hour: 'numeric',
                minute: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Status timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Order Status</Text>
          <View style={styles.timeline}>
            {TIMELINE.map((step, idx) => {
              const isComplete = idx <= currentStatusIdx;
              const isCancelled = order.status === 'cancelled';
              const isCurrent = idx === currentStatusIdx && !isCancelled;
              return (
                <View key={step.status} style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineCircle,
                      isComplete && !isCancelled && styles.timelineCircleComplete,
                      isCancelled && styles.timelineCircleCancelled,
                      isCurrent && styles.timelineCircleCurrent,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={step.icon}
                      size={16}
                      color={isComplete && !isCancelled ? 'white' : Colors.textTertiary}
                    />
                  </View>
                  {idx < TIMELINE.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        idx < currentStatusIdx && styles.timelineLineComplete,
                        isCancelled && styles.timelineLineCancelled,
                      ]}
                    />
                  )}
                  <Text
                    style={[
                      styles.timelineLabel,
                      isComplete && !isCancelled && styles.timelineLabelComplete,
                      isCancelled && styles.timelineLabelCancelled,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
          {order.status === 'cancelled' && (
            <View style={styles.cancelledBanner}>
              <Ionicons name="close-circle-outline" size={20} color={Colors.danger} />
              <Text style={styles.cancelledText}>This order was cancelled.</Text>
            </View>
          )}
        </View>

        {/* Delivery address */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={16} color={Colors.primary} />
            <Text style={styles.addressText}>{order.delivery_address}</Text>
          </View>
        </View>

        {/* Order items */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
          {order.items.map((item) => (
            <View key={item.product_id} style={styles.orderItem}>
              <View style={styles.itemImageWrap}>
                {item.image_url ? (
                  <Image source={{ uri: getItemImageUrl(item) ?? undefined }} style={styles.itemImage} resizeMode="cover" />
                ) : (
                  <View style={styles.itemImagePlaceholder}>
                    <MaterialCommunityIcons name="package-variant" size={20} color={Colors.textTertiary} />
                  </View>
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Bill summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Bill Details</Text>
          <BillRow label="Subtotal" value={`$${order.subtotal.toFixed(2)}`} />
          <BillRow
            label="Delivery Fee"
            value={order.delivery_fee === 0 ? 'FREE' : `$${order.delivery_fee.toFixed(2)}`}
            valueStyle={order.delivery_fee === 0 ? { color: Colors.success } : undefined}
          />
          {order.discount > 0 && (
            <BillRow
              label="Discount"
              value={`-$${order.discount.toFixed(2)}`}
              valueStyle={{ color: Colors.success }}
            />
          )}
          <View style={styles.billDivider} />
          <BillRow label="Total Paid" value={`$${order.total.toFixed(2)}`} bold />
          <Text style={styles.paymentMethod}>
            Payment: {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method === 'card' ? 'Card' : 'Wallet'}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  vendorLogo: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  orderDate: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  timelineCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  timelineTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  timeline: {
    gap: Spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    position: 'relative',
    minHeight: 40,
  },
  timelineCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineCircleComplete: {
    backgroundColor: Colors.primary,
  },
  timelineCircleCurrent: {
    backgroundColor: Colors.primary,
    transform: [{ scale: 1.15 }],
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  timelineCircleCancelled: {
    backgroundColor: Colors.danger,
  },
  timelineLine: {
    position: 'absolute',
    left: 14,
    top: 24,
    width: 2,
    height: 28,
    backgroundColor: Colors.border,
    zIndex: 1,
  },
  timelineLineComplete: {
    backgroundColor: Colors.primary,
  },
  timelineLineCancelled: {
    backgroundColor: Colors.danger,
  },
  timelineLabel: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  timelineLabelComplete: {
    color: Colors.text,
    fontWeight: FontWeight.semibold,
  },
  timelineLabelCancelled: {
    color: Colors.danger,
  },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    backgroundColor: Colors.dangerBg,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  cancelledText: {
    color: Colors.danger,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  addressText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  itemImageWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  itemQty: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  billRowLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  billRowLabelBold: {
    color: Colors.text,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.md,
  },
  billRowValue: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  billRowValueBold: {
    color: Colors.text,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.md,
  },
  billDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  paymentMethod: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
});
