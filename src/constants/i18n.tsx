// i18n — lightweight translation layer porting Flutter's .tr mechanism.
// Loads Flutter's en/ar/bn/es JSON files from assets/languages/.
// Replaces GetX's .tr extension with a t(key) function and useT() hook.

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { AppConstants } from './app_constants';

// Static-import the language JSONs so Metro bundler picks them up.
// (Using require avoids needing asset bundling config for JSON on web.)
import en from '../../assets/languages/en.json';
import ar from '../../assets/languages/ar.json';
import bn from '../../assets/languages/bn.json';
import es from '../../assets/languages/es.json';

export type LanguageCode = 'en' | 'ar' | 'bn' | 'es';
export type TranslationMap = Record<string, string>;

const TRANSLATIONS: Record<LanguageCode, TranslationMap> = {
  en: en as TranslationMap,
  ar: ar as TranslationMap,
  bn: bn as TranslationMap,
  es: es as TranslationMap,
};

export const LANGUAGES: { code: LanguageCode; label: string; nativeLabel: string; flag: string; rtl: boolean }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸', rtl: false },
  { code: 'ar', label: 'Arabic', nativeLabel: 'عربي', flag: '🇸🇦', rtl: true },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸', rtl: false },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', flag: '🇧🇩', rtl: false },
];

interface I18nContextValue {
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  rtl: boolean;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
  rtl: false,
});

// Load persisted language preference (sync, since AsyncStorage is async we fall back to 'en' on first render)
function loadInitialLang(): LanguageCode {
  if (Platform.OS === 'web') {
    try {
      const stored = localStorage.getItem(AppConstants.language);
      if (stored && stored in TRANSLATIONS) return stored as LanguageCode;
    } catch {}
  }
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(loadInitialLang);

  const setLang = (l: LanguageCode) => {
    setLangState(l);
    if (Platform.OS === 'web') {
      try { localStorage.setItem(AppConstants.language, l); } catch {}
    } else {
      // Persist via AsyncStorage lazily (avoid import cycle with auth store)
      import('@react-native-async-storage/async-storage')
        .then((m) => m.default.setItem(AppConstants.language, l))
        .catch(() => {});
    }
  };

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>) => {
      const dict = TRANSLATIONS[lang] ?? TRANSLATIONS.en;
      let value = dict[key];
      if (value === undefined || value === null || value === '') {
        // Fallback to English, then to the key itself
        value = TRANSLATIONS.en[key] ?? key;
      }
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(new RegExp(`@${k}@`, 'g'), String(v));
        }
      }
      return value;
    };
  }, [lang]);

  const rtl = useMemo(() => {
    const meta = LANGUAGES.find((l) => l.code === lang);
    return meta?.rtl ?? false;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, rtl }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

// Convenience standalone function — uses current provider value via hook.
export function useT() {
  return useI18n().t;
}
