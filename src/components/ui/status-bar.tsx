// Themed wrapper around Expo's StatusBar — sets bar style/background
// to match the app theme so every screen doesn't repeat this setup.

import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { Colors } from '@/constants/theme';

export function StatusBar() {
  return (
    <ExpoStatusBar
      style="dark"
      backgroundColor={Platform.OS === 'android' ? Colors.background : undefined}
    />
  );
}
