// Refer & Earn screen — V4.0 port of Flutter lib/features/refer_and_earn/screens/refer_and_earn_screen.dart
import { StyleSheet, View, Text, Pressable, ScrollView, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton } from '@/components/ui/index';
import { useAuth } from '@/store/auth';
import { Images } from '@/constants/images';

export default function ReferEarnScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const referCode = session.user?.refer_code ?? 'CUSTOMAR';
  const referralLink = `https://customar.app/r/${referCode}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on Customar! Use my referral code ${referCode} to sign up and we both get $10. ${referralLink}`,
      });
    } catch {}
  };

  const handleCopy = () => {
    // Clipboard copy would go here
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <MaterialCommunityIcons name="gift-outline" size={80} color={Colors.textInverse} />
          <Text style={styles.heroTitle}>Get $10 for every friend you refer</Text>
          <Text style={styles.heroSubtitle}>Your friend gets $10 too! Share your code and start earning.</Text>
        </View>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <View style={styles.codeRow}>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{referCode}</Text>
            </View>
            <Pressable style={styles.iconBtn} onPress={handleCopy}>
              <Ionicons name="copy-outline" size={20} color={Colors.primary} />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color={Colors.primary} />
            </Pressable>
          </View>
        </View>

        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={styles.stepCard}>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>Invite your friends</Text>
              <Text style={styles.stepDescription}>Share your referral code with friends via social media or messaging.</Text>
            </View>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>Friend signs up</Text>
              <Text style={styles.stepDescription}>Your friend enters your code when signing up on Customar.</Text>
            </View>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>You both earn $10</Text>
              <Text style={styles.stepDescription}>After their first order, you both get $10 credited to your wallet.</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social" size={20} color={Colors.textInverse} />
          <Text style={styles.shareBtnText}>Share Now</Text>
        </Pressable>

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
  heroCard: { backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.md },
  heroTitle: { color: Colors.textInverse, fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginTop: Spacing.md, textAlign: 'center' },
  heroSubtitle: { color: Colors.textInverse, opacity: 0.85, fontSize: FontSize.sm, marginTop: Spacing.xs, textAlign: 'center' },
  codeCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg },
  codeLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm, textAlign: 'center' },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  codeBox: { flex: 1, backgroundColor: Colors.primaryLight, borderRadius: Radius.md, paddingVertical: Spacing.md, borderWidth: 2, borderColor: Colors.primary, borderStyle: 'dashed' },
  codeText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary, textAlign: 'center', letterSpacing: 2 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  stepCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: Spacing.sm, gap: Spacing.md },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: Colors.textInverse, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  stepTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  stepDescription: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  shareBtn: { flexDirection: 'row', backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: Spacing.lg, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  shareBtnText: { color: Colors.textInverse, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
});
