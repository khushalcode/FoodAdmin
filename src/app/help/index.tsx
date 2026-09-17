// Help & Support screen — FAQs and contact options.

import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton } from '@/components/ui/index';

interface FAQ {
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    q: 'How do I place an order?',
    a: 'Browse the home screen, tap a category, select the items you want to purchase, then proceed to checkout. You can pay via cash, card, or wallet.',
  },
  {
    q: 'What is the delivery time?',
    a: 'Delivery times vary by vendor and are shown on each store card. Most grocery and pharmacy orders arrive within 20-40 minutes; food orders within 25-40 minutes.',
  },
  {
    q: 'How can I track my order?',
    a: 'Go to the Orders tab to see all your active and past orders. Tap any order to view its real-time status and delivery timeline.',
  },
  {
    q: 'What is your refund policy?',
    a: 'If you receive damaged or incorrect items, you can request a refund within 24 hours of delivery. Refunds are credited back to your original payment method within 5-7 business days.',
  },
  {
    q: 'How do I become a vendor?',
    a: 'Open the Profile tab, scroll to "Open Vendor", and follow the registration process. Our team will review your application within 2-3 business days.',
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need help with your order?</Text>
          <Text style={styles.contactSubtitle}>
            Our support team is available 24/7 to help you with any questions.
          </Text>
          <View style={styles.contactRow}>
            <Pressable style={styles.contactBtn}>
              <Ionicons name="chatbubbles-outline" size={20} color={Colors.primary} />
              <Text style={styles.contactBtnText}>Live Chat</Text>
            </Pressable>
            <Pressable style={styles.contactBtn}>
              <Ionicons name="call-outline" size={20} color={Colors.primary} />
              <Text style={styles.contactBtnText}>Call Us</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqList}>
          {FAQS.map((faq, i) => (
            <View key={i} style={styles.faqCard}>
              <Pressable
                style={styles.faqHeader}
                onPress={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Ionicons
                  name={openIdx === i ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={Colors.textSecondary}
                />
              </Pressable>
              {openIdx === i && (
                <Text style={styles.faqAnswer}>{faq.a}</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  contactCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  contactTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primaryDark,
  },
  contactSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
  },
  contactBtnText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  faqList: {
    gap: Spacing.sm,
  },
  faqCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    flex: 1,
    paddingRight: Spacing.md,
  },
  faqAnswer: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: Spacing.sm,
  },
});
