// Campaigns screen — V4.0 port of Flutter lib/features/store/screens/campaign_screen.dart
// Lists promotional campaigns (basic + item campaigns).

import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, EmptyState } from '@/components/ui/index';
import { DEMO_CAMPAIGNS } from '@/data/demo-data';
import type { Campaign } from '@/types';

export default function CampaignsScreen() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use demo campaigns
    setCampaigns(DEMO_CAMPAIGNS);
    setLoading(false);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Campaigns</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xxxl }} />
      ) : campaigns.length === 0 ? (
        <EmptyState icon="bullhorn-outline" title="No active campaigns" subtitle="Check back later for exciting promotions." />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Active campaigns */}
          <Text style={styles.sectionTitle}>Active Campaigns</Text>
          {campaigns.filter(c => c.status === 'ongoing').map((c) => (
            <CampaignCard key={c.id} campaign={c} onPress={() => router.push('/category/grocery')} />
          ))}

          {/* Upcoming */}
          {campaigns.filter(c => c.status === 'upcoming').length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Upcoming</Text>
              {campaigns.filter(c => c.status === 'upcoming').map((c) => (
                <CampaignCard key={c.id} campaign={c} onPress={() => router.push('/category/grocery')} />
              ))}
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

function CampaignCard({ campaign, onPress }: { campaign: Campaign; onPress: () => void }) {
  const isOngoing = campaign.status === 'ongoing';
  const statusColor = isOngoing ? Colors.success : Colors.warning;
  const statusBg = isOngoing ? Colors.primaryLight : Colors.catYellow;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardImageWrap}>
        {campaign.image_url ? (
          <Image source={{ uri: campaign.image_url }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <MaterialCommunityIcons name="bullhorn" size={32} color={Colors.textInverse} />
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{isOngoing ? 'LIVE NOW' : 'UPCOMING'}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.title}>{campaign.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{campaign.description}</Text>
        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <Ionicons name="calendar-outline" size={11} color={Colors.textTertiary} />
            <Text style={styles.dateText}>Starts: {new Date(campaign.start_date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.dateItem}>
            <Ionicons name="calendar-outline" size={11} color={Colors.textTertiary} />
            <Text style={styles.dateText}>Ends: {new Date(campaign.end_date).toLocaleDateString()}</Text>
          </View>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: statusBg }]}>
          <Text style={[styles.typeText, { color: statusColor }]}>
            {campaign.type === 'basic' ? 'Store Campaign' : 'Item Campaign'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.background },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md, marginTop: Spacing.sm },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing.md, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4 },
  cardImageWrap: { height: 140, backgroundColor: Colors.primary, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  cardImagePlaceholder: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  statusBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { color: Colors.textInverse, fontSize: 10, fontWeight: FontWeight.bold },
  cardBody: { padding: Spacing.md },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  description: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  dateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.sm },
  dateItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 10, color: Colors.textTertiary },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginTop: Spacing.sm },
  typeText: { fontSize: 10, fontWeight: FontWeight.bold },
});
