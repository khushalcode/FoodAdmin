// Loyalty screen — V4.0 port of Flutter lib/features/loyalty/screens/loyalty_screen.dart
import { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, EmptyState } from '@/components/ui/index';
import { Button } from '@/components/ui/button';
import { useLoyalty } from '@/store/loyalty';

export default function LoyaltyScreen() {
  const router = useRouter();
  const { points, transactions, exchangeRate, minExchangeAmount, convertToWallet } = useLoyalty();
  const [showConvert, setShowConvert] = useState(false);
  const [pointsToConvert, setPointsToConvert] = useState('');

  const walletValue = points / exchangeRate;
  const handleConvert = useCallback(async () => {
    const pts = parseInt(pointsToConvert, 10);
    if (!pts || pts <= 0) {
      Alert.alert('Invalid points', 'Please enter a valid number of points');
      return;
    }
    const result = await convertToWallet(pts);
    if (result.success) {
      setShowConvert(false);
      setPointsToConvert('');
      Alert.alert('Success', `${pts} points converted to $${(pts / exchangeRate).toFixed(2)}`);
    } else {
      Alert.alert('Error', result.message ?? 'Failed to convert points');
    }
  }, [pointsToConvert, convertToWallet, exchangeRate]);

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Loyalty Points</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.pointsCard}>
          <MaterialCommunityIcons name="star-circle" size={48} color={Colors.textInverse} />
          <Text style={styles.pointsLabel}>Your Points</Text>
          <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>
          <Text style={styles.pointsWorth}>≈ ${walletValue.toFixed(2)} wallet value</Text>
          <Pressable style={styles.convertBtn} onPress={() => setShowConvert(true)}>
            <Text style={styles.convertBtnText}>Convert to Wallet</Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Exchange Rate</Text>
            <Text style={styles.infoValue}>{exchangeRate} pts = $1.00</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Minimum Conversion</Text>
            <Text style={styles.infoValue}>{minExchangeAmount} pts</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Points History</Text>
        {transactions.length === 0 ? (
          <EmptyState icon="star-outline" title="No points earned yet" subtitle="Earn points by placing orders." />
        ) : (
          transactions.map((tx) => (
            <View key={tx.id} style={styles.txCard}>
              <View style={[styles.txIcon, { backgroundColor: tx.type === 'credit' ? Colors.primaryLight : Colors.dangerBg }]}>
                <Ionicons name={tx.type === 'credit' ? 'add' : 'remove'} size={18} color={tx.type === 'credit' ? Colors.primary : Colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txDescription} numberOfLines={1}>{tx.description}</Text>
                <Text style={styles.txMeta}>{tx.reference} · {new Date(tx.created_at).toLocaleDateString()}</Text>
              </View>
              <Text style={[styles.txPoints, { color: tx.type === 'credit' ? Colors.success : Colors.danger }]}>
                {tx.type === 'credit' ? '+' : '-'}{tx.points}
              </Text>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showConvert} transparent animationType="slide" onRequestClose={() => setShowConvert(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Convert Points to Wallet</Text>
            <Text style={styles.modalSubtitle}>Available: {points.toLocaleString()} pts</Text>
            <View style={styles.amountInput}>
              <TextInput style={styles.amountField} placeholder="0" keyboardType="numeric" value={pointsToConvert} onChangeText={setPointsToConvert} autoFocus />
              <Text style={styles.inputSuffix}>pts</Text>
            </View>
            {pointsToConvert ? (
              <Text style={styles.conversionPreview}>
                = ${(parseInt(pointsToConvert, 10) / exchangeRate).toFixed(2)} wallet balance
              </Text>
            ) : null}
            <View style={styles.modalActions}>
              <Button label="Cancel" variant="ghost" onPress={() => setShowConvert(false)} style={{ flex: 1, marginRight: Spacing.sm }} />
              <Button label="Convert" onPress={handleConvert} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.background },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  pointsCard: { backgroundColor: Colors.warning, borderRadius: Radius.lg, padding: Spacing.xl, marginBottom: Spacing.md, alignItems: 'center' },
  pointsLabel: { color: Colors.textInverse, opacity: 0.85, fontSize: FontSize.sm, marginTop: Spacing.sm },
  pointsValue: { color: Colors.textInverse, fontSize: 40, fontWeight: FontWeight.bold },
  pointsWorth: { color: Colors.textInverse, opacity: 0.85, fontSize: FontSize.sm, marginTop: Spacing.xs },
  convertBtn: { marginTop: Spacing.lg, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
  convertBtnText: { color: Colors.textInverse, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  infoCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm },
  infoLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  infoValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
  infoDivider: { height: 1, backgroundColor: Colors.borderLight },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  txCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md },
  txIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txDescription: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  txMeta: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  txPoints: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.xl },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.xs, textAlign: 'center' },
  modalSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
  amountInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, marginBottom: Spacing.sm },
  amountField: { flex: 1, fontSize: 28, fontWeight: FontWeight.bold, color: Colors.text },
  inputSuffix: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.bold },
  conversionPreview: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold, marginBottom: Spacing.lg, textAlign: 'center' },
  modalActions: { flexDirection: 'row' },
});
