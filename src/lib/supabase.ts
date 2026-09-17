// Supabase configuration.
//
// The values are read from app.json `extra` block (preferred) so the user can
// drop in their own project URL + anon key without editing source code.
//
// To wire your own Supabase project:
//   1. Create a project at https://supabase.com
//   2. Open app.json and set `expo.extra.supabaseUrl` and `expo.extra.supabaseAnonKey`
//      (or set EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY env vars)
//   3. Run the SQL in src/supabase/schema.sql against your database.

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// Custom storage that works for both native (SecureStore) and web (AsyncStorage).
const ExpoSecureStore = {
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

const SUPABASE_URL =
  Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://YOUR-PROJECT-REF.supabase.co';

const SUPABASE_ANON_KEY =
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'YOUR-SUPABASE-ANON-KEY';

export const isSupabaseConfigured =
  SUPABASE_URL.startsWith('https://') &&
  !SUPABASE_URL.includes('YOUR-PROJECT-REF') &&
  SUPABASE_ANON_KEY !== 'YOUR-SUPABASE-ANON-KEY' &&
  SUPABASE_ANON_KEY.length > 20;

// If the user hasn't configured Supabase yet we still create the client with
// placeholder values so the imports don't crash - the auth/data layer will
// gracefully fall back to local demo data when not configured.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStore,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
