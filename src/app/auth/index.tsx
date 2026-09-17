// Auth modal — login / signup / OTP / guest.
// Page 3 of the PDF design mockup.

import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Modal, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AuthScreen() {
  const router = useRouter();
  const {
    signInWithPassword,
    signUpWithPassword,
    signInWithOtp,
    verifyOtp,
    signInWithGoogle,
    continueAsGuest,
    isConfigured,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'otp' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);

  const handlePasswordLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error: err } = await signUpWithPassword(email, password, name);
        if (err) {
          setError(err);
          return;
        }
      } else {
        const { error: err } = await signInWithPassword(email, password);
        if (err) {
          setError(err);
          return;
        }
      }
      router.replace('/(tabs)/home');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpRequest = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: err, otp: demoOtp } = await signInWithOtp(phone);
      if (err) {
        setError(err);
        return;
      }
      if (demoOtp) {
        setGeneratedOtp(demoOtp);
      }
      setMode('verify');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await verifyOtp(phone, otp);
      if (err) {
        setError(err);
        return;
      }
      router.replace('/(tabs)/home');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await signInWithGoogle();
      if (err) {
        setError(err);
        return;
      }
      router.replace('/(tabs)/home');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    await continueAsGuest();
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        {/* Faux home screen behind the modal — same color scheme as Home */}
        <View style={styles.fakeHeader}>
          <View style={styles.fakeHeaderLeft}>
            <Text style={styles.fakeLabel}>Deliver To</Text>
            <Text style={styles.fakeAddress}>V48M+7J3, Siroliya, Madhy...</Text>
          </View>
          <Ionicons name="notifications-outline" size={22} color={Colors.text} />
        </View>
      </View>

      <Modal visible transparent animationType="slide" statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Pressable onPress={() => router.back()} hitSlop={12} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={Colors.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>
                To get more personalised & smooth experience please log in or sign up
              </Text>

              {!isConfigured && (
                <View style={styles.demoBanner}>
                  <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
                  <Text style={styles.demoText}>
                    Demo mode — Supabase not configured. Use any email/password, or OTP 123456.
                  </Text>
                </View>
              )}

              {/* Google button */}
              <Pressable style={styles.googleBtn} onPress={handleGoogle}>
                <Ionicons name="logo-google" size={20} color={Colors.text} />
                <Text style={styles.googleText}>Continue with Google</Text>
              </Pressable>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {mode === 'login' && (
                <View style={styles.form}>
                  <Input
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    icon="mail-outline"
                  />
                  <Input
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry
                    icon="lock-closed-outline"
                    rightIcon="eye-outline"
                    onRightIconPress={() => {}}
                  />
                  {error && <Text style={styles.error}>{error}</Text>}
                  <Button
                    label="Login With Password"
                    block
                    size="lg"
                    loading={loading}
                    onPress={handlePasswordLogin}
                    style={styles.mainBtn}
                  />
                  <Button
                    label="Login With OTP"
                    variant="secondary"
                    block
                    size="lg"
                    onPress={() => {
                      setError(null);
                      setMode('otp');
                    }}
                    style={styles.mainBtn}
                  />
                  <Pressable onPress={() => { setError(null); setMode('signup'); }}>
                    <Text style={styles.footerText}>
                      Don't have an account? <Text style={styles.footerLink}>Sign up</Text>
                    </Text>
                  </Pressable>
                </View>
              )}

              {mode === 'signup' && (
                <View style={styles.form}>
                  <Input
                    label="Full Name"
                    value={name}
                    onChangeText={setName}
                    placeholder="John Doe"
                    icon="person-outline"
                  />
                  <Input
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    icon="mail-outline"
                  />
                  <Input
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry
                    icon="lock-closed-outline"
                  />
                  {error && <Text style={styles.error}>{error}</Text>}
                  <Button
                    label="Create Account"
                    block
                    size="lg"
                    loading={loading}
                    onPress={handlePasswordLogin}
                    style={styles.mainBtn}
                  />
                  <Pressable onPress={() => { setError(null); setMode('login'); }}>
                    <Text style={styles.footerText}>
                      Already have an account? <Text style={styles.footerLink}>Log in</Text>
                    </Text>
                  </Pressable>
                </View>
              )}

              {mode === 'otp' && (
                <View style={styles.form}>
                  <Input
                    label="Phone Number"
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+1 555 123 4567"
                    keyboardType="phone-pad"
                    icon="call-outline"
                  />
                  {error && <Text style={styles.error}>{error}</Text>}
                  <Button
                    label="Send OTP"
                    block
                    size="lg"
                    loading={loading}
                    onPress={handleOtpRequest}
                    style={styles.mainBtn}
                  />
                  <Pressable onPress={() => { setError(null); setMode('login'); }}>
                    <Text style={styles.footerText}>
                      <Text style={styles.footerLink}>Back to login</Text>
                    </Text>
                  </Pressable>
                </View>
              )}

              {mode === 'verify' && (
                <View style={styles.form}>
                  {generatedOtp && (
                    <View style={styles.demoBanner}>
                      <Ionicons name="key-outline" size={16} color={Colors.info} />
                      <Text style={styles.demoText}>Demo OTP: {generatedOtp}</Text>
                    </View>
                  )}
                  <Input
                    label="Enter OTP"
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="123456"
                    keyboardType="numeric"
                    icon="key-outline"
                  />
                  {error && <Text style={styles.error}>{error}</Text>}
                  <Button
                    label="Verify OTP"
                    block
                    size="lg"
                    loading={loading}
                    onPress={handleOtpVerify}
                    style={styles.mainBtn}
                  />
                  <Pressable onPress={() => setMode('otp')}>
                    <Text style={styles.footerText}>
                      <Text style={styles.footerLink}>Change phone number</Text>
                    </Text>
                  </Pressable>
                </View>
              )}

              <Pressable onPress={handleGuest} hitSlop={8}>
                <Text style={styles.guestText}>Continue As Guest</Text>
              </Pressable>

              <Text style={styles.legal}>
                By continuing, you agree to our{' '}
                <Text style={styles.legalLink}>Terms and conditions</Text> and{' '}
                <Text style={styles.legalLink}>Privacy Policy</Text>
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fakeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 80,
  },
  fakeHeaderLeft: {
    flex: 1,
  },
  fakeLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  fakeAddress: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    maxHeight: '92%',
    paddingBottom: Spacing.xxxl,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBody: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#DBEAFE',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  demoText: {
    fontSize: FontSize.xs,
    color: Colors.info,
    flex: 1,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md + 2,
    minHeight: 50,
  },
  googleText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  dividerText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
  },
  form: {
    marginBottom: Spacing.md,
  },
  mainBtn: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  footerText: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  guestText: {
    textAlign: 'center',
    color: Colors.info,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginTop: Spacing.lg,
  },
  legal: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
    lineHeight: 18,
  },
  legalLink: {
    color: Colors.info,
    fontWeight: FontWeight.medium,
  },
  error: {
    color: Colors.danger,
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
});
