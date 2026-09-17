// Parcel send form — V4.0 port of Flutter lib/features/parcel/screens/parcel_request_screen.dart
import { StyleSheet, View, Text, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton } from '@/components/ui/index';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function ParcelSendScreen() {
  const router = useRouter();
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [note, setNote] = useState('');

  const handleSend = () => {
    if (!senderName || !senderPhone || !senderAddress || !receiverName || !receiverPhone || !receiverAddress) {
      Alert.alert('Missing info', 'Please fill all required fields');
      return;
    }
    Alert.alert('Success', 'Parcel request submitted! A rider will be assigned shortly.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Send Parcel</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: Colors.primaryLight }]}><Ionicons name="arrow-up" size={16} color={Colors.primary} /></View>
            <Text style={styles.sectionTitle}>Sender Information</Text>
          </View>
          <TextInput style={styles.input} placeholder="Full Name" value={senderName} onChangeText={setSenderName} />
          <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" value={senderPhone} onChangeText={setSenderPhone} />
          <TextInput style={[styles.input, { minHeight: 60 }]} placeholder="Pickup Address" multiline value={senderAddress} onChangeText={setSenderAddress} />
          <Pressable style={styles.mapBtn}><Ionicons name="location-outline" size={16} color={Colors.primary} /><Text style={styles.mapBtnText}>Set on Map</Text></Pressable>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: Colors.dangerBg }]}><Ionicons name="arrow-down" size={16} color={Colors.danger} /></View>
            <Text style={styles.sectionTitle}>Receiver Information</Text>
          </View>
          <TextInput style={styles.input} placeholder="Full Name" value={receiverName} onChangeText={setReceiverName} />
          <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" value={receiverPhone} onChangeText={setReceiverPhone} />
          <TextInput style={[styles.input, { minHeight: 60 }]} placeholder="Delivery Address" multiline value={receiverAddress} onChangeText={setReceiverAddress} />
          <Pressable style={styles.mapBtn}><Ionicons name="location-outline" size={16} color={Colors.primary} /><Text style={styles.mapBtnText}>Set on Map</Text></Pressable>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: Colors.catMint }]}><Ionicons name="document-text-outline" size={16} color={Colors.info} /></View>
            <Text style={styles.sectionTitle}>Additional Notes (optional)</Text>
          </View>
          <TextInput style={[styles.input, { minHeight: 80 }]} placeholder="Type your note for parcel" multiline value={note} onChangeText={setNote} />
        </View>

        <View style={styles.estimateCard}>
          <View style={styles.estimateRow}>
            <Text style={styles.estimateLabel}>Distance</Text>
            <Text style={styles.estimateValue}>~ 5.2 km</Text>
          </View>
          <View style={styles.estimateRow}>
            <Text style={styles.estimateLabel}>Estimated Time</Text>
            <Text style={styles.estimateValue}>~ 40 min</Text>
          </View>
          <View style={styles.estimateDivider} />
          <View style={styles.estimateRow}>
            <Text style={styles.estimateTotalLabel}>Total</Text>
            <Text style={styles.estimateTotalValue}>$7.99</Text>
          </View>
        </View>

        <Button label="Send Parcel" icon="send-outline" size="lg" onPress={handleSend} style={{ marginTop: Spacing.lg }} />
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
  sectionCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  input: { backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSize.sm, color: Colors.text, marginBottom: Spacing.sm },
  mapBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: Radius.md, marginTop: Spacing.xs },
  mapBtnText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  estimateCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, marginTop: Spacing.sm },
  estimateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  estimateLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  estimateValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  estimateDivider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.sm },
  estimateTotalLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  estimateTotalValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
});
