// Static HTML content screen — V4.0 port of Flutter lib/features/html/screens/
// Used for About Us, Privacy Policy, Terms & Conditions, Cancellation, Refund, Shipping.
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton } from '@/components/ui/index';
import { useLocalSearchParams } from 'expo-router';

const CONTENT: Record<string, { title: string; body: string[] }> = {
  about: {
    title: 'About Us',
    body: [
      'Welcome to Customar — your one-stop destination for groceries, food, pharmacy, parcels, and more.',
      'Our mission is to bring every neighborhood the convenience of having essential services at your fingertips, delivered with care and speed.',
      'Founded in 2024, Customar now serves thousands of customers daily across multiple cities, partnering with hundreds of local vendors and thousands of delivery partners.',
      'We believe in supporting local businesses while providing customers with the best prices, exclusive deals, and reliable service 24/7.',
      'For any inquiries, reach us at support@customar.app or call +1-555-CUSTOMAR.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    body: [
      'This Privacy Policy describes how Customar collects, uses, and shares your personal information when you use our mobile application and services.',
      'We collect information you provide directly to us, such as your name, email, phone number, delivery address, and payment information when you create an account or place an order.',
      'We use your information to process orders, communicate with you about your orders, provide customer support, and improve our services.',
      'We do not sell your personal information to third parties. We may share your information with vendors and delivery partners solely for the purpose of fulfilling your orders.',
      'You have the right to access, update, or delete your personal information at any time through the app settings or by contacting us.',
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    body: [
      'By using Customar, you agree to these Terms & Conditions. Please read them carefully.',
      'You must be at least 18 years old to use our services. By placing an order, you represent that you are of legal age to enter into a binding contract.',
      'All orders are subject to availability. We reserve the right to refuse or cancel any order at our discretion.',
      'Prices are subject to change without notice. Promotional offers are valid for a limited time and may be withdrawn at any time.',
      'You agree to provide accurate delivery information and to be available at the delivery address during the scheduled time.',
    ],
  },
  cancellation: {
    title: 'Cancellation Policy',
    body: [
      'You can cancel your order free of charge before it has been confirmed by the vendor.',
      'Once the vendor has confirmed your order, a cancellation fee may apply depending on the stage of order preparation.',
      'Orders that are already out for delivery cannot be cancelled and will need to be returned at the time of delivery.',
      'Customar reserves the right to cancel any order due to unforeseen circumstances, with a full refund issued to the original payment method.',
    ],
  },
  refund: {
    title: 'Refund Policy',
    body: [
      'We offer refunds for orders that are cancelled by the vendor, failed to deliver, or have quality issues reported within 24 hours of delivery.',
      'Refunds are processed back to the original payment method within 5-7 business days, depending on your bank.',
      'For wallet payments, refunds are instant and credited back to your Customar wallet.',
      'To request a refund, please contact our support team through the app or email support@customar.app with your order details.',
    ],
  },
  shipping: {
    title: 'Shipping Policy',
    body: [
      'We offer delivery services 24/7 in most serviceable areas. Delivery times may vary based on your location and the vendor\'s operating hours.',
      'Standard grocery and food deliveries typically arrive within 30-60 minutes. Pharmacy and shop deliveries may take longer.',
      'Free delivery is available on orders above $50. Below that, a nominal delivery fee applies based on distance.',
      'For parcel and ride-share services, pricing is calculated based on distance, weight (for parcels), and vehicle type (for rides).',
    ],
  },
};

export default function HtmlScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const type = params.type ?? 'about';
  const content = CONTENT[type] ?? CONTENT.about;

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>{content.title}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{content.title}</Text>
        {content.body.map((p, i) => (
          <Text key={i} style={styles.paragraph}>{p}</Text>
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
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  paragraph: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.md },
});
