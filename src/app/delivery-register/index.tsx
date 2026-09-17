// Delivery man registration screen — V4.0 port of Flutter lib/features/business/screens/
import { StyleSheet, View, Text, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton } from '@/components/ui/index';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function DeliveryRegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [zone, setZone] = useState('');

  const handleSubmit = () => {
    if (!name || !phone || !email) {
      Alert.alert('Missing info', 'Please fill all required fields');
      return;
    }
    Alert.alert('Application Submitted!', 'We will review your application and contact you within 2-3 business days.', [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Join as Delivery Man</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <MaterialCommunityIcons name="bike-fast" size={64} color={Colors.textInverse} />
          <Text style={styles.heroTitle}>Earn with Customar</Text>
          <Text style={styles.heroSubtitle}>Flexible hours, great earnings, weekly payouts</Text>
        </View>

        <View style={styles.benefitsCard}>
          <Text style={styles.sectionTitle}>Why deliver with us?</Text>
          <View style={styles.benefitRow}><Ionicons name="cash" size={20} color={Colors.primary} /><Text style={styles.benefitText}>Earn $15-25/hour on average</Text></View>
          <View style={styles.benefitRow}><Ionicons name="time" size={20} color={Colors.primary} /><Text style={styles.benefitText}>Choose your own working hours</Text></View>
          <View style={styles.benefitRow}><Ionicons name="calendar" size={20} color={Colors.primary} /><Text style={styles.benefitText}>Weekly payouts to your bank</Text></View>
          <View style={styles.benefitRow}><Ionicons name="trophy" size={20} color={Colors.primary} /><Text style={styles.benefitText}>Bonuses for top performers</Text></View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <TextInput style={styles.input} placeholder="Full Name *" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Phone Number *" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          <TextInput style={styles.input} placeholder="Email *" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Vehicle Type (Bike / Car / Cycle)" value={vehicleType} onChangeText={setVehicleType} />
          <TextInput style={styles.input} placeholder="Preferred Zone" value={zone} onChangeText={setZone} />

          <Text style={styles.sectionTitle}>Required Documents</Text>
          <View style={styles.docsRow}>
            {['ID Proof', 'License', 'Vehicle RC', 'Photo'].map((doc) => (
              <Pressable key={doc} style={styles.docCard}>
                <Ionicons name="document-attach-outline" size={28} color={Colors.primary} />
                <Text style={styles.docName}>{doc}</Text>
                <Text style={styles.docUpload}>Upload</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Button label="Submit Application" icon="checkmark-circle-outline" size="lg" onPress={handleSubmit} style={{ marginTop: Spacing.lg }} />
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
  heroCard: { backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg },
  heroTitle: { color: Colors.textInverse, fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginTop: Spacing.md, textAlign: 'center' },
  heroSubtitle: { color: Colors.textInverse, opacity: 0.85, fontSize: FontSize.sm, marginTop: Spacing.xs, textAlign: 'center' },
  benefitsCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xs },
  benefitText: { fontSize: FontSize.sm, color: Colors.text },
  formCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  input: { backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSize.sm, color: Colors.text, marginBottom: Spacing.sm },
  docsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  docCard: { width: '48%', backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.sm },
  docName: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.text, marginTop: Spacing.xs },
  docUpload: { fontSize: 10, color: Colors.primary, fontWeight: FontWeight.bold, marginTop: 4 },
});
