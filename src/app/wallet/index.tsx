// Wallet screen — V4.0 port of Flutter lib/features/wallet/screens/wallet_screen.dart
import { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, EmptyState } from '@/components/ui/index';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/store/wallet';

export default function WalletScreen() {
  const router = useRouter();
  const { balance, transactions, loading, addFunds } = useWallet();
  const [showTopup, setShowTopup] = useState(false);
  const [amount, setAmount] = useState('');

  const handleTopup = useCallback(async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount');
      return;
    }
    const result = await addFunds(amt);
    if (result.success) {
      setShowTopup(false);
      setAmount('');
      Alert.alert('Success', `$${amt.toFixed(2)} added to your wallet`);
    } else {
      Alert.alert('Error', result.message ?? 'Failed to add funds');
    }
  }, [amount, addFunds]);

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>My Wallet</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <MaterialCommunityIcons name="wallet" size={28} color={Colors.textInverse} />
            <View style={{ marginLeft: Spacing.md }}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceValue}>${balance.toFixed(2)}</Text>
            </View>
          </View>
          <Pressable style={styles.topupBtn} onPress={() => setShowTopup(true)}>
            <Text style={styles.topupBtnText}>+ Add Money</Text>
          </Pressable>
        </View>

        <Pressable style={styles.convertCard} onPress={() => router.push('/loyalty')}>
          <MaterialCommunityIcons name="star-circle" size={28} color={Colors.warning} />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.convertTitle}>Convert Loyalty Points</Text>
            <Text style={styles.convertSubtitle}>Turn your points into wallet balance</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
        </Pressable>

        <Text style={styles.sectionTitle}>Transaction History</Text>
        {transactions.length === 0 ? (
          <EmptyState icon="clipboard-list-outline" title="No transactions yet" subtitle="Your wallet activity will appear here." />
        ) : (
          transactions.map((tx) => (
            <View key={tx.id} style={styles.txCard}>
              <View style={[styles.txIcon, { backgroundColor: tx.type === 'credit' ? Colors.primaryLight : Colors.dangerBg }]}>
                <Ionicons name={tx.type === 'credit' ? 'arrow-down' : 'arrow-up'} size={18} color={tx.type === 'credit' ? Colors.primary : Colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txDescription} numberOfLines={1}>{tx.description}</Text>
                <Text style={styles.txMeta}>{tx.reference} · {new Date(tx.created_at).toLocaleDateString()}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.type === 'credit' ? Colors.success : Colors.danger }]}>
                {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
              </Text>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showTopup} transparent animationType="slide" onRequestClose={() => setShowTopup(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Money to Wallet</Text>
            <View style={styles.amountInput}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput style={styles.amountField} placeholder="0.00" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} autoFocus />
            </View>
            <View style={styles.quickAmounts}>
              {[10, 25, 50, 100].map((amt) => (
                <Pressable key={amt} style={styles.quickAmountBtn} onPress={() => setAmount(String(amt))}>
                  <Text style={styles.quickAmountText}>${amt}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.modalActions}>
              <Button label="Cancel" variant="ghost" onPress={() => setShowTopup(false)} style={{ flex: 1, marginRight: Spacing.sm }} />
              <Button label="Add Money" onPress={handleTopup} style={{ flex: 1 }} />
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
  balanceCard: { backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: Spacing.xl, marginBottom: Spacing.md },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceLabel: { color: Colors.textInverse, opacity: 0.85, fontSize: FontSize.sm, marginBottom: Spacing.xs },
  balanceValue: { color: Colors.textInverse, fontSize: 32, fontWeight: FontWeight.bold },
  topupBtn: { marginTop: Spacing.lg, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center' },
  topupBtnText: { color: Colors.textInverse, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  convertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.borderLight },
  convertTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  convertSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  txCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md },
  txIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txDescription: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  txMeta: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  txAmount: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.xl },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.lg, textAlign: 'center' },
  amountInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, marginBottom: Spacing.md },
  currencySymbol: { fontSize: 28, fontWeight: FontWeight.bold, color: Colors.text },
  amountField: { flex: 1, fontSize: 28, fontWeight: FontWeight.bold, color: Colors.text, marginLeft: Spacing.sm },
  quickAmounts: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.lg },
  quickAmountBtn: { flex: 1, marginHorizontal: 4, backgroundColor: Colors.primaryLight, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center' },
  quickAmountText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  modalActions: { flexDirection: 'row' },
});
