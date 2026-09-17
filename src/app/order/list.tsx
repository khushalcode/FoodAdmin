// Order list screen — V4.0 port of Flutter lib/features/order/screens/order_list_screen.dart
import { StyleSheet, View, Text, Pressable, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, EmptyState } from '@/components/ui/index';
import { useOrders } from '@/store/orders';

export default function OrderListScreen() {
  const router = useRouter();
  const { orders, loading } = useOrders();

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>All Orders</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {orders.length === 0 ? (
          <EmptyState icon="clipboard-list-outline" title="No orders yet" subtitle="Your orders will appear here." />
        ) : (
          orders.map((order) => {
            const status = order.order_status ?? order.status ?? 'placed';
            return (
              <Pressable key={order.id} style={styles.orderCard} onPress={() => router.push(`/order/${order.id}`)}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderIconWrap}>
                    <Ionicons name="clipboard-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderCode}>#{order.order_code ?? order.id}</Text>
                    <Text style={styles.orderStore}>{order.store_name}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusBgColor(status) }]}>
                    <Text style={[styles.statusText, { color: statusTextColor(status) }]}>{statusLabel(status)}</Text>
                  </View>
                </View>
                <View style={styles.orderBody}>
                  <Text style={styles.orderItems}>{order.item_count} items · ${order.total.toFixed(2)}</Text>
                  <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleString()}</Text>
                </View>
              </Pressable>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function statusBgColor(s: string): string {
  switch (s) {
    case 'placed': return Colors.catBlue;
    case 'confirmed': return Colors.catBlue;
    case 'preparing': return Colors.catYellow;
    case 'out_for_delivery': return Colors.catOrange;
    case 'delivered': return Colors.primaryLight;
    case 'cancelled':
    case 'canceled': return Colors.dangerBg;
    default: return Colors.surfaceAlt;
  }
}
function statusTextColor(s: string): string {
  switch (s) {
    case 'placed':
    case 'confirmed': return Colors.info;
    case 'preparing': return Colors.warning;
    case 'out_for_delivery': return '#F97316';
    case 'delivered': return Colors.primary;
    case 'cancelled':
    case 'canceled': return Colors.danger;
    default: return Colors.textSecondary;
  }
}
function statusLabel(s: string): string {
  switch (s) {
    case 'placed': return 'Placed';
    case 'confirmed': return 'Confirmed';
    case 'preparing': return 'Preparing';
    case 'out_for_delivery': return 'On the way';
    case 'delivered': return 'Delivered';
    case 'cancelled':
    case 'canceled': return 'Cancelled';
    default: return s;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.background },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  orderCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  orderHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  orderIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  orderCode: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
  orderStore: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: FontWeight.bold },
  orderBody: { borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.sm, flexDirection: 'row', justifyContent: 'space-between' },
  orderItems: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.semibold },
  orderDate: { fontSize: FontSize.xs, color: Colors.textTertiary },
});
