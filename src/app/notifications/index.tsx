// Notifications screen — V4.0 port of Flutter lib/features/notification/screens/notification_screen.dart
import { StyleSheet, View, Text, Pressable, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, EmptyState } from '@/components/ui/index';
import { useNotifications } from '@/store/notifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <Pressable onPress={markAllRead}><Text style={styles.markAllText}>Mark all</Text></Pressable>
        ) : <View style={{ width: 38 }} />}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {notifications.length === 0 ? (
          <EmptyState icon="bell-outline" title="No notifications" subtitle="You're all caught up!" />
        ) : (
          notifications.map((n) => (
            <Pressable key={n.id} style={[styles.notifCard, !n.is_read && styles.notifCardUnread]} onPress={() => markRead(n.id)}>
              <View style={[styles.notifIcon, { backgroundColor: typeBg(n.type) }]}>
                <MaterialCommunityIcons name={typeIcon(n.type)} size={20} color={typeColor(n.type)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifBody} numberOfLines={2}>{n.body}</Text>
                <Text style={styles.notifTime}>{timeAgo(n.created_at)}</Text>
              </View>
              {!n.is_read && <View style={styles.unreadDot} />}
            </Pressable>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function typeIcon(t: string): any {
  switch (t) {
    case 'order': return 'package-variant-closed';
    case 'promotion': return 'tag';
    case 'coupon': return 'ticket';
    case 'message': return 'chat';
    default: return 'bell';
  }
}
function typeColor(t: string): string {
  switch (t) {
    case 'order': return Colors.primary;
    case 'promotion': return Colors.danger;
    case 'coupon': return Colors.info;
    case 'message': return Colors.warning;
    default: return Colors.textSecondary;
  }
}
function typeBg(t: string): string {
  switch (t) {
    case 'order': return Colors.primaryLight;
    case 'promotion': return Colors.dangerBg;
    case 'coupon': return Colors.catBlue;
    case 'message': return Colors.catYellow;
    default: return Colors.surfaceAlt;
  }
}
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.background },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  markAllText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  notifCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md },
  notifCardUnread: { backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primary },
  notifIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  notifTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  notifBody: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  notifTime: { fontSize: 10, color: Colors.textTertiary, marginTop: Spacing.xs },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 6 },
});
