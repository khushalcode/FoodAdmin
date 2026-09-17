// Orders screen — shows order history with status badges.
// Includes category tabs (Pharmacy, Shop, Food, Parcel, Rental) and Running/History filter.

import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, EmptyState } from '@/components/ui/index';
import { useOrders } from '@/store/orders';
import type { Order, OrderStatus } from '@/types'; import { getItemImageUrl } from '@/types';

type CategoryTab = 'pharmacy' | 'shop' | 'food' | 'parcel' | 'rental';
type StatusFilter = 'running' | 'history';

interface OrdersScreenProps {
  onTabNavigate?: (k: any) => void;
}

const CATEGORY_TABS: CategoryTab[] = ['pharmacy', 'shop', 'food', 'parcel', 'rental'];

export function OrdersScreen({ onTabNavigate }: OrdersScreenProps) {
  const router = useRouter();
  const { orders, loading } = useOrders();
  const [category, setCategory] = useState<CategoryTab>('pharmacy');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('history');

  const filtered = orders.filter((o) => {
    const status = o.order_status ?? o.status ?? 'placed';
    if (statusFilter === 'running') {
      if (['delivered', 'cancelled'].includes(status)) return false;
    } else if (statusFilter === 'history') {
      if (!['delivered', 'cancelled'].includes(status)) return false;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => onTabNavigate?.('home')} />
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catTabsRow}>
        {CATEGORY_TABS.map((c) => {
          const isActive = c === category;
          return (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              style={[styles.catTab, isActive && styles.catTabActive]}
              hitSlop={4}
            >
              <Text style={[styles.catTabText, isActive && styles.catTabTextActive]}>
                {capitalize(c)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Status filter — segmented control (Running / History) */}
      <View style={styles.filterRow}>
        <View style={styles.segControl}>
          {(['running', 'history'] as StatusFilter[]).map((f) => {
            const isActive = f === statusFilter;
            return (
              <Pressable
                key={f}
                onPress={() => setStatusFilter(f)}
                style={[styles.segBtn, isActive && styles.segBtnActive]}
              >
                <Text style={[styles.segText, isActive && styles.segTextActive]}>
                  {capitalize(f)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {loading ? (
        // Skeleton loaders (matches page 55 design)
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.skeletonRow}>
                <View style={styles.skeletonCircle} />
                <View style={{ flex: 1 }}>
                  <View style={styles.skeletonLine} />
                  <View style={[styles.skeletonLine, { width: '60%', marginTop: 6 }]} />
                </View>
                <View style={[styles.skeletonLine, { width: 60 }]} />
              </View>
              <View style={[styles.skeletonRow, { marginTop: Spacing.md }]}>
                {[1, 2, 3].map((j) => (
                  <View key={j} style={styles.skeletonThumb} />
                ))}
                <View style={{ flex: 1 }} />
                <View style={[styles.skeletonLine, { width: 80 }]} />
              </View>
            </View>
          ))}
        </ScrollView>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="clipboard-text-outline"
          title="No trip found"
          subtitle={`You have no ${statusFilter === 'running' ? 'running' : 'past'} ${category} orders yet.`}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {filtered.map((o) => (
            <OrderCard key={o.id} order={o} onPress={() => router.push(`/order/${o.id}`)} />
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const status = order.order_status ?? order.status ?? 'placed';
  const statusColor = statusColorFor(status);
  const statusLabel = statusLabelFor(status);
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Pressable style={styles.orderCard} onPress={onPress}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderVendorName}>{order.vendor_name}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.created_at).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>
      <View style={styles.orderBody}>
        <View style={styles.orderItemsPreview}>
          {order.items.slice(0, 3).map((item) => (
            <View key={item.product_id} style={styles.itemThumb}>
              {item.image_url ? (
                <Image source={{ uri: getItemImageUrl(item) ?? undefined }} style={styles.itemImage} resizeMode="cover" />
              ) : (
                <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                  <MaterialCommunityIcons name="package-variant" size={20} color={Colors.textTertiary} />
                </View>
              )}
            </View>
          ))}
          {order.items.length > 3 && (
            <View style={[styles.itemThumb, styles.moreThumb]}>
              <Text style={styles.moreText}>+{order.items.length - 3}</Text>
            </View>
          )}
        </View>
        <View style={styles.orderRight}>
          <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
        </View>
      </View>
    </Pressable>
  );
}

function statusColorFor(s: OrderStatus): string {
  switch (s) {
    case 'placed': return Colors.info;
    case 'confirmed': return Colors.info;
    case 'preparing': return Colors.warning;
    case 'out_for_delivery': return Colors.warning;
    case 'delivered': return Colors.success;
    case 'cancelled': return Colors.danger;
    default: return "";
  }
}

function statusLabelFor(s: OrderStatus): string {
  switch (s) {
    case 'placed': return 'Placed';
    case 'confirmed': return 'Confirmed';
    case 'preparing': return 'Preparing';
    case 'out_for_delivery': return 'Out for delivery';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    default: return "";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  catTabsRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    gap: Spacing.md,
  },
  catTab: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  catTabActive: {},
  catTabText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
  },
  catTabTextActive: {
    color: Colors.text,
    fontWeight: FontWeight.bold,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  segControl: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.pill,
    padding: 4,
    flex: 1,
  },
  segBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
  segBtnActive: {
    backgroundColor: Colors.primary,
  },
  segText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  segTextActive: {
    color: Colors.textInverse,
    fontWeight: FontWeight.bold,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  skeletonCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  skeletonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 4,
    width: '100%',
  },
  skeletonThumb: {
    width: 50,
    height: 50,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  orderVendorName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  orderDate: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemsPreview: {
    flexDirection: 'row',
    gap: -8,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.surface,
    marginRight: -8,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImagePlaceholder: {
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreThumb: {
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.bold,
  },
  orderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  orderTotal: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
});
