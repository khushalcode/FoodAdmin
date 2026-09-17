// Auth context - wraps Supabase auth with graceful fallback to guest mode
// when Supabase is not configured. Persists session via Supabase's storage.

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { apiClient } from '@/lib/api_client';
import { AppConstants } from '@/constants/app_constants';
import type { AppSession, AuthMethod, User } from '@/types';

interface AuthContextValue {
  session: AppSession;
  loading: boolean;
  isConfigured: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  signInWithOtp: (phone: string) => Promise<{ error: string | null; otp?: string }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithFacebook: () => Promise<{ error: string | null }>;
  signInWithApple: () => Promise<{ error: string | null }>;
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: { full_name?: string; phone?: string; preferred_language?: string; image_url?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const GUEST_STORAGE_KEY = 'customar.guest';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AppSession>({
    user: null,
    method: null,
    token: null,
  });
  const [loading, setLoading] = useState(true);

  // Fetch user info from REST backend after Supabase login (best-effort)
  const fetchCustomerInfo = useCallback(async (): Promise<Partial<User> | null> => {
    try {
      const res = await apiClient.getData<User>(AppConstants.customerInfoUri);
      if (res.code === 200 && res.data) {
        return res.data;
      }
    } catch {}
    return null;
  }, []);

  // Load session on mount
  useEffect(() => {
    let mounted = true;

    async function load() {
      // 1. Check Supabase session
      if (isSupabaseConfigured) {
        const { data } = await supabase.auth.getSession();
        if (mounted && data.session?.user) {
          const token = data.session.access_token;
          await apiClient.setToken(token);
          const info = await fetchCustomerInfo();
          setSession({
            user: {
              id: data.session.user.id,
              email: data.session.user.email ?? null,
              phone: data.session.user.phone ?? null,
              name: (data.session.user.user_metadata as any)?.full_name ?? null,
              image_url: (data.session.user.user_metadata as any)?.avatar_url ?? null,
              is_guest: false,
              is_email_verified: data.session.user.email_confirmed_at != null,
              is_phone_verified: data.session.user.phone_confirmed_at != null,
              loyalty_points: info?.loyalty_points ?? 0,
              wallet_balance: info?.wallet_balance ?? 0,
              order_count: info?.order_count ?? 0,
              member_since: info?.member_since ?? null,
              refer_code: info?.refer_code ?? null,
            },
            method: 'password',
            token,
          });
        }
      }

      // 2. Check for stored guest session
      if (mounted && !session.user) {
        try {
          const guest = await readGuest();
          if (guest) {
            setSession({
              user: {
                id: guest.id,
                email: null,
                phone: null,
                name: guest.name,
                image_url: null,
                is_guest: true,
                is_email_verified: false,
                is_phone_verified: false,
                loyalty_points: 0,
                wallet_balance: 0,
                order_count: 0,
                member_since: null,
                refer_code: null,
              },
              method: 'guest',
              token: null,
            });
          }
        } catch {
          // ignore storage errors
        }
      }

      if (mounted) setLoading(false);
    }

    load();

    // Listen for Supabase auth changes
    if (isSupabaseConfigured) {
      const { data: sub } = supabase.auth.onAuthStateChange(async (_event, supaSession) => {
        if (!mounted) return;
        if (supaSession?.user) {
          const token = supaSession.access_token;
          await apiClient.setToken(token);
          const info = await fetchCustomerInfo();
          setSession({
            user: {
              id: supaSession.user.id,
              email: supaSession.user.email ?? null,
              phone: supaSession.user.phone ?? null,
              name: (supaSession.user.user_metadata as any)?.full_name ?? null,
              image_url: (supaSession.user.user_metadata as any)?.avatar_url ?? null,
              is_guest: false,
              is_email_verified: supaSession.user.email_confirmed_at != null,
              is_phone_verified: supaSession.user.phone_confirmed_at != null,
              loyalty_points: info?.loyalty_points ?? 0,
              wallet_balance: info?.wallet_balance ?? 0,
              order_count: info?.order_count ?? 0,
              member_since: info?.member_since ?? null,
              refer_code: info?.refer_code ?? null,
            },
            method: 'password',
            token,
          });
        }
      });
      return () => {
        mounted = false;
        sub.subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Demo mode: accept any non-empty email/password
      if (!email || !password) return { error: 'Please enter email and password' };
      const guestId = `demo-${Date.now()}`;
      await storeGuest({ id: guestId, name: email.split('@')[0] });
      setSession({
        user: { id: guestId, email, phone: null, name: email.split('@')[0], image_url: null, is_guest: false, is_email_verified: false, is_phone_verified: false, loyalty_points: 0, wallet_balance: 0, order_count: 0, member_since: new Date().toISOString(), refer_code: 'DEMO1234' },
        method: 'password',
        token: `demo-token-${Date.now()}`,
      });
      return { error: null };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      await apiClient.setToken(data.session.access_token);
      const info = await fetchCustomerInfo();
      setSession({
        user: {
          id: data.user!.id,
          email: data.user!.email ?? null,
          phone: data.user!.phone ?? null,
          name: (data.user!.user_metadata as any)?.full_name ?? null,
          image_url: (data.user!.user_metadata as any)?.avatar_url ?? null,
          is_guest: false,
          is_email_verified: data.user!.email_confirmed_at != null,
          is_phone_verified: data.user!.phone_confirmed_at != null,
          loyalty_points: info?.loyalty_points ?? 0,
          wallet_balance: info?.wallet_balance ?? 0,
          order_count: info?.order_count ?? 0,
          member_since: info?.member_since ?? null,
          refer_code: info?.refer_code ?? null,
        },
        method: 'password',
        token: data.session.access_token,
      });
    }
    return { error: error?.message ?? null };
  }, [fetchCustomerInfo]);

  const signUpWithPassword = useCallback(
    async (email: string, password: string, name?: string) => {
      if (!isSupabaseConfigured) {
        if (!email || !password) return { error: 'Please enter email and password' };
        const guestId = `demo-${Date.now()}`;
        await storeGuest({ id: guestId, name: name || email.split('@')[0] });
        setSession({
          user: { id: guestId, email, phone: null, name: name || email.split('@')[0], image_url: null, is_guest: false, is_email_verified: false, is_phone_verified: false, loyalty_points: 0, wallet_balance: 0, order_count: 0, member_since: new Date().toISOString(), refer_code: 'DEMO1234' },
          method: 'password',
          token: `demo-token-${Date.now()}`,
        });
        return { error: null };
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (!error && data.session) {
        await apiClient.setToken(data.session.access_token);
        // Also create a legacy `users` row (unified with admin panel DB)
        // The user_profiles row is auto-created by the auth trigger (see base_schema.sql).
        try {
          await supabase.from('users').insert({
            name: name ?? email.split('@')[0],
            email,
            is_active: true,
            status: 'approved',
            is_email_verified: false,
            wallet_balance: 0,
            loyalty_point: 0,
            ref_code: `CUST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          });
          // Activate the user_profiles row created by the trigger
          await supabase.from('user_profiles')
            .update({ is_active: true, role: 'customer' })
            .eq('user_id', data.user!.id);
        } catch {}
        setSession({
          user: {
            id: data.user!.id,
            email: data.user!.email ?? null,
            phone: data.user!.phone ?? null,
            name: name ?? null,
            image_url: null,
            is_guest: false,
            is_email_verified: data.user!.email_confirmed_at != null,
            is_phone_verified: data.user!.phone_confirmed_at != null,
            loyalty_points: 0,
            wallet_balance: 0,
            order_count: 0,
            member_since: new Date().toISOString(),
            refer_code: null,
          },
          method: 'password',
          token: data.session.access_token,
        });
      }
      return { error: error?.message ?? null };
    },
    []
  );

  const signInWithOtp = useCallback(async (phone: string) => {
    if (!isSupabaseConfigured) {
      if (!phone) return { error: 'Please enter a phone number' };
      // Demo mode: return a fixed OTP for testing
      return { error: null, otp: '123456' };
    }
    const { error } = await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: true } });
    return { error: error?.message ?? null };
  }, []);

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    if (!isSupabaseConfigured) {
      if (token !== '123456') return { error: 'Invalid OTP. Use 123456 in demo mode.' };
      const guestId = `demo-${phone}`;
      await storeGuest({ id: guestId, name: phone });
      setSession({
        user: { id: guestId, email: null, phone, name: phone, image_url: null, is_guest: false, is_email_verified: false, is_phone_verified: true, loyalty_points: 0, wallet_balance: 0, order_count: 0, member_since: new Date().toISOString(), refer_code: 'DEMO1234' },
        method: 'otp',
        token: `demo-token-${Date.now()}`,
      });
      return { error: null };
    }
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    return { error: error?.message ?? null };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) {
      // Demo mode
      const guestId = `demo-google-${Date.now()}`;
      await storeGuest({ id: guestId, name: 'Google User' });
      setSession({
        user: { id: guestId, email: 'google.user@gmail.com', phone: null, name: 'Google User', image_url: null, is_guest: false, is_email_verified: true, is_phone_verified: false, loyalty_points: 0, wallet_balance: 0, order_count: 0, member_since: new Date().toISOString(), refer_code: 'GOOG1234' },
        method: 'google',
        token: `demo-token-${Date.now()}`,
      });
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    return { error: error?.message ?? null };
  }, []);

  const signInWithFacebook = useCallback(async () => {
    if (!isSupabaseConfigured) {
      const guestId = `demo-facebook-${Date.now()}`;
      await storeGuest({ id: guestId, name: 'Facebook User' });
      setSession({
        user: { id: guestId, email: 'fb.user@gmail.com', phone: null, name: 'Facebook User', image_url: null, is_guest: false, is_email_verified: true, is_phone_verified: false, loyalty_points: 0, wallet_balance: 0, order_count: 0, member_since: new Date().toISOString(), refer_code: 'FB1234' },
        method: 'facebook',
        token: `demo-token-${Date.now()}`,
      });
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'facebook' });
    return { error: error?.message ?? null };
  }, []);

  const signInWithApple = useCallback(async () => {
    if (!isSupabaseConfigured) {
      const guestId = `demo-apple-${Date.now()}`;
      await storeGuest({ id: guestId, name: 'Apple User' });
      setSession({
        user: { id: guestId, email: 'apple.user@icloud.com', phone: null, name: 'Apple User', image_url: null, is_guest: false, is_email_verified: true, is_phone_verified: false, loyalty_points: 0, wallet_balance: 0, order_count: 0, member_since: new Date().toISOString(), refer_code: 'APPL1234' },
        method: 'apple',
        token: `demo-token-${Date.now()}`,
      });
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'apple' });
    return { error: error?.message ?? null };
  }, []);

  const continueAsGuest = useCallback(async () => {
    const guestId = `guest-${Date.now()}`;
    await storeGuest({ id: guestId, name: 'Guest' });
    setSession({
      user: { id: guestId, email: null, phone: null, name: 'Guest', image_url: null, is_guest: true, is_email_verified: false, is_phone_verified: false, loyalty_points: 0, wallet_balance: 0, order_count: 0, member_since: null, refer_code: null },
      method: 'guest',
      token: null,
    });
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    await apiClient.setToken(null);
    await clearGuest();
    setSession({ user: null, method: null, token: null });
  }, []);

  const updateProfile = useCallback(
    async (data: { full_name?: string; phone?: string; preferred_language?: string; image_url?: string }) => {
      if (!session.user) return;
      if (isSupabaseConfigured && !session.user.is_guest) {
        await supabase.auth.updateUser({ data });
        // Also push to REST backend (best-effort)
        try {
          await apiClient.putData(AppConstants.updateProfileUri, {
            f_name: data.full_name,
            phone: data.phone,
            image: data.image_url,
          });
        } catch {}
      }
      setSession((prev) => ({
        ...prev,
        user: prev.user
          ? {
              ...prev.user,
              name: data.full_name ?? prev.user.name,
              phone: data.phone ?? prev.user.phone,
              image_url: data.image_url ?? prev.user.image_url,
            }
          : null,
      }));
    },
    [session.user]
  );

  const refreshUser = useCallback(async () => {
    const info = await fetchCustomerInfo();
    if (info) {
      setSession((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...info } as User : prev.user,
      }));
    }
  }, [fetchCustomerInfo]);

  const value: AuthContextValue = {
    session,
    loading,
    isConfigured: isSupabaseConfigured,
    signInWithPassword,
    signUpWithPassword,
    signInWithOtp,
    verifyOtp,
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
    continueAsGuest,
    signOut,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// --- Guest storage helpers (AsyncStorage) ---
async function storeGuest(g: { id: string; name: string }) {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(g));
  } catch (e) {
    // ignore
  }
}

async function readGuest(): Promise<{ id: string; name: string } | null> {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const raw = await AsyncStorage.getItem(GUEST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function clearGuest() {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
  } catch {
    // ignore
  }
}
