// Theme store — light/dark mode toggle, persists to AsyncStorage.
// Ported from Flutter lib/common/controllers/theme_controller.dart.

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConstants } from '@/constants/app_constants';
import { LightColors, DarkColors, type ThemeMode } from '@/constants/theme';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: typeof LightColors;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  colors: LightColors as any,
  toggle: () => {},
  setMode: () => {},
});

const STORAGE_KEY = AppConstants.theme;

async function loadMode(): Promise<ThemeMode> {
  try {
    if (Platform.OS === 'web') {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'dark' || v === 'light') return v;
    } else {
      const v = await AsyncStorage.getItem(STORAGE_KEY);
      if (v === 'dark' || v === 'light') return v;
    }
  } catch {}
  return 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    let mounted = true;
    loadMode().then((m) => { if (mounted) setModeState(m); });
    return () => { mounted = false; };
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    if (Platform.OS === 'web') localStorage.setItem(STORAGE_KEY, m);
    else AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      if (Platform.OS === 'web') localStorage.setItem(STORAGE_KEY, next);
      else AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const colors = (mode === 'dark' ? DarkColors : LightColors) as typeof LightColors;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggle, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
