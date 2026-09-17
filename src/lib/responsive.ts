// ResponsiveHelper — ported from Flutter lib/helper/responsive_helper.dart
// Provides screen-size breakpoints & layout helpers.

import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const ResponsiveHelper = {
  isMobile: width < 600,
  isTablet: width >= 600 && width < 900,
  isWeb: Platform.OS === 'web',
  isDesktop: Platform.OS === 'web' && width >= 1300,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  screenWidth: width,
  screenHeight: height,
  webMaxWidth: 1170,

  // Return a numeric value scaled by screen width (Flutter Dimensions-like)
  fontSize(value: number): number {
    if (width >= 1300) return value + 2;
    return value;
  },

  // Return the percentage of screen width
  wp(percentage: number): number {
    return (percentage * width) / 100;
  },

  // Return the percentage of screen height
  hp(percentage: number): number {
    return (percentage * height) / 100;
  },
};

export function useResponsive() {
  return ResponsiveHelper;
}
