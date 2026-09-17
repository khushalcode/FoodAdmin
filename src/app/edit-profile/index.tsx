// Update Profile screen — matches PDF page 51 design.
// Green header with back arrow + title, centered avatar overlapping header,
// "Basic Information" card with Name/Email/Phone + "Change Password" row,
// large green "Update" button at bottom.

import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/auth';

export default function EditProfileScreen() {
  const router = useRouter();
  const { session, updateProfile } = useAuth();
  const [name, setName] = useState(session.user?.name || '');
  const [email, setEmail] = useState(session.user?.email || '');
  const [phone, setPhone] = useState(session.user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ full_name: name, phone });
    setSaving(false);
    Alert.alert('Saved', 'Your profile has been updated.');
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      {/* Green header */}
      <View style={styles.header}>
        <Pressable style={styles.headerBtn} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.textInverse} />
        </Pressable>
        <Text style={styles.headerTitle}>Update Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar centered over green header */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <Pressable style={styles.cameraBtn} onPress={() => Alert.alert('Coming soon', 'Photo upload is not available in this demo.')}>
            <Ionicons name="camera" size={14} color={Colors.textInverse} />
          </Pressable>
        </View>

        {/* Basic Information card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Basic Information</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Name</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={16} color={Colors.textTertiary} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldLabelRow}>
              <Text style={styles.fieldLabel}>E-mail</Text>
              {email ? (
                <View style={styles.validBadge}>
                  <Ionicons name="checkmark-circle" size={11} color={Colors.success} />
                  <Text style={styles.validText}>Valid</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={16} color={Colors.textTertiary} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldLabelRow}>
              <Text style={styles.fieldLabel}>Phone</Text>
              {phone && phone.length < 10 ? (
                <View style={styles.warnBadge}>
                  <Ionicons name="warning" size={11} color={Colors.warning} />
                  <Text style={styles.warnText}>Invalid</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={16} color={Colors.textTertiary} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 555 123 4567"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Change Password row */}
          <Pressable style={styles.changePwdRow} onPress={() => Alert.alert('Coming soon', 'Change password flow not implemented in demo.')}>
            <View style={styles.changePwdLeft}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.primary} />
              <Text style={styles.changePwdText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </Pressable>
        </View>

        {/* Update button */}
        <Button
          label="Update"
          block
          size="lg"
          loading={saving}
          onPress={handleSave}
          style={{ marginTop: Spacing.xl, marginBottom: Spacing.xxxl }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    paddingBottom: Spacing.xl + 20,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 0,
    marginTop: -40,
  },
  avatarWrap: {
    alignSelf: 'center',
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  field: {
    marginBottom: Spacing.md,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  validBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  validText: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: FontWeight.bold,
  },
  warnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.catYellow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  warnText: {
    fontSize: 10,
    color: Colors.warning,
    fontWeight: FontWeight.bold,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    padding: 0,
  },
  changePwdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  changePwdLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  changePwdText: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },
});
