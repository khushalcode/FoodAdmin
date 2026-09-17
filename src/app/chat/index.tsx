// Chat list screen — V4.0 port of Flutter lib/features/chat/screens/
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton } from '@/components/ui/index';

const CONVERSATIONS = [
  { id: 1, type: 'vendor', name: 'Fresh Foods Store', last_message: 'Your order is on the way!', unread_count: 2, is_online: true, last_message_at: '5 min ago' },
  { id: 2, type: 'admin', name: 'Customar Support', last_message: 'How can we help you today?', unread_count: 0, is_online: true, last_message_at: '2 hours ago' },
  { id: 3, type: 'delivery_man', name: 'Rider John', last_message: 'I have arrived at your location.', unread_count: 1, is_online: false, last_message_at: '1 day ago' },
  { id: 4, type: 'ai_bot', name: 'AI Assistant', last_message: 'Try our new flash sale!', unread_count: 0, is_online: true, last_message_at: '3 days ago' },
];

export default function ChatListScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {CONVERSATIONS.map((c) => (
          <Pressable key={c.id} style={styles.chatCard} onPress={() => router.push(`/chat/${c.id}`)}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons
                name={c.type === 'vendor' ? 'store' : c.type === 'admin' ? 'headset' : c.type === 'delivery_man' ? 'bike' : 'robot'}
                size={24}
                color={Colors.primary}
              />
              {c.is_online && <View style={styles.onlineDot} />}
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatName} numberOfLines={1}>{c.name}</Text>
                <Text style={styles.chatTime}>{c.last_message_at}</Text>
              </View>
              <View style={styles.chatPreview}>
                <Text style={styles.chatMessage} numberOfLines={1}>{c.last_message}</Text>
                {c.unread_count > 0 && (
                  <View style={styles.unreadBadge}><Text style={styles.unreadText}>{c.unread_count}</Text></View>
                )}
              </View>
            </View>
          </Pressable>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.background },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  chatCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.surface },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, flex: 1 },
  chatTime: { fontSize: 10, color: Colors.textTertiary },
  chatPreview: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  chatMessage: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  unreadBadge: { backgroundColor: Colors.primary, minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  unreadText: { color: Colors.textInverse, fontSize: 10, fontWeight: FontWeight.bold },
});
