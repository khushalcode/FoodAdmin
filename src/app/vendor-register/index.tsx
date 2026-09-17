// Vendor registration screen — V4.0 port of Flutter lib/features/business/screens/
import { StyleSheet, View, Text, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton } from '@/components/ui/index';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function VendorRegisterScreen() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = () => {
    if (!businessName || !ownerName || !phone || !email || !address) {
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
        <Text style={styles.headerTitle}>Open Vendor Account</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <MaterialCommunityIcons name="store" size={64} color={Colors.textInverse} />
          <Text style={styles.heroTitle}>Grow your business with Customar</Text>
          <Text style={styles.heroSubtitle}>Reach thousands of customers in your area</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          <TextInput style={styles.input} placeholder="Business Name *" value={businessName} onChangeText={setBusinessName} />
          <TextInput style={styles.input} placeholder="Owner Name *" value={ownerName} onChangeText={setOwnerName} />
          <TextInput style={styles.input} placeholder="Phone Number *" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          <TextInput style={styles.input} placeholder="Email *" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Business Category" value={category} onChangeText={setCategory} />
          <TextInput style={[styles.input, { minHeight: 80 }]} placeholder="Business Address *" multiline value={address} onChangeText={setAddress} />

          <Text style={styles.sectionTitle}>Required Documents</Text>
          <View style={styles.docsRow}>
            {['Trade License', 'Tax ID', 'Bank Details', 'Logo'].map((doc) => (
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
  formCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md },
  input: { backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSize.sm, color: Colors.text, marginBottom: Spacing.sm },
  docsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  docCard: { width: '48%', backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.sm },
  docName: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.text, marginTop: Spacing.xs },
  docUpload: { fontSize: 10, color: Colors.primary, fontWeight: FontWeight.bold, marginTop: 4 },
});
