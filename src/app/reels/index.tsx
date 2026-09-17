// Reels screen — V4.0 port of Flutter lib/features/reels/screens/
import { StyleSheet, View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton } from '@/components/ui/index';
import { DEMO_REELS } from '@/data/demo-data';
import { useState } from 'react';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ReelsScreen() {
  const router = useRouter();
  const [likedReels, setLikedReels] = useState<Set<number>>(new Set());

  const toggleLike = (id: number) => {
    setLikedReels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Reels</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} pagingEnabled snapToInterval={SCREEN_HEIGHT - 100} decelerationRate="fast">
        {DEMO_REELS.map((reel) => {
          const liked = likedReels.has(reel.id) || reel.is_liked;
          return (
            <View key={reel.id} style={styles.reel}>
              <View style={styles.reelPlaceholder}>
                <MaterialCommunityIcons name="play-circle" size={80} color={Colors.textInverse} />
                <Text style={styles.reelTitle}>{reel.title}</Text>
              </View>

              <View style={styles.overlay}>
                <View style={styles.leftInfo}>
                  <Text style={styles.reelTitleText}>{reel.title}</Text>
                  <View style={styles.reelMeta}>
                    <Ionicons name="eye-outline" size={14} color={Colors.textInverse} />
                    <Text style={styles.metaText}>{reel.views_count.toLocaleString()} views</Text>
                  </View>
                </View>
              </View>

              <View style={styles.rightActions}>
                <Pressable style={styles.actionBtn} onPress={() => toggleLike(reel.id)}>
                  <Ionicons name={liked ? 'heart' : 'heart-outline'} size={28} color={liked ? Colors.danger : Colors.textInverse} />
                  <Text style={styles.actionText}>{reel.likes_count + (liked && !reel.is_liked ? 1 : 0)}</Text>
                </Pressable>
                <Pressable style={styles.actionBtn}>
                  <Ionicons name="chatbubble-outline" size={28} color={Colors.textInverse} />
                  <Text style={styles.actionText}>{reel.comments_count}</Text>
                </Pressable>
                <Pressable style={styles.actionBtn}>
                  <Ionicons name="share-social-outline" size={28} color={Colors.textInverse} />
                  <Text style={styles.actionText}>Share</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: '#000' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textInverse },
  reel: { height: SCREEN_HEIGHT - 100, backgroundColor: '#111', position: 'relative' },
  reelPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  reelTitle: { color: Colors.textInverse, fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginTop: Spacing.md },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 60, padding: Spacing.lg },
  leftInfo: {},
  reelTitleText: { color: Colors.textInverse, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  reelMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs },
  metaText: { color: Colors.textInverse, opacity: 0.8, fontSize: FontSize.xs },
  rightActions: { position: 'absolute', right: 0, bottom: 0, padding: Spacing.lg, alignItems: 'center', gap: Spacing.md },
  actionBtn: { alignItems: 'center' },
  actionText: { color: Colors.textInverse, fontSize: FontSize.xs, marginTop: 4 },
});
