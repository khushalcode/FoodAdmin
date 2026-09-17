// Theme — FoodHub Customer App · "Aurora" Redesign (unified with vendor app)
//
// Unified design system across admin / vendor / customer / delivery apps:
//   - Primary: electric violet (#7C5CFF) with fuchsia hero gradient (#C026D3)
//   - Accent: electric cyan (#06B6D4)
//   - Light, airy surfaces with lavender-tinted canvas
//   - Soft, violet-tinted shadows
//   - Generous rounding (radii 10–40)
//
// All admin-controlled features (banners, coupons, campaigns, flash sales,
// loyalty tiers, etc.) now use this palette for visual consistency across
// the customer ↔ admin ↔ vendor ↔ delivery round trip.

export type ThemeMode = 'light' | 'dark';

// Light theme colors — Aurora palette (matches vendor app)
export const LightColors = {
  primary: '#7C5CFF',            // Electric violet — Aurora primary
  primaryDark: '#5B3FE0',        // Pressed / hover
  primaryLight: '#F1ECFF',       // Active tab bg, badge bg
  primarySofter: '#F7F3FF',      // Soft violet bg, gradient start
  accent: '#06B6D4',             // Electric cyan — secondary highlights
  accentSoft: '#E0F7FB',
  accentForeground: '#0E7490',
  primaryGradientStart: '#7C5CFF',
  primaryGradientEnd: '#A855F7',
  heroGradientStart: '#7C5CFF',  // Hero gradient start (auth/home/wallet)
  heroGradientEnd: '#C026D3',    // Hero gradient end (fuchsia)
  accentGradientStart: '#06B6D4',
  accentGradientEnd: '#7C5CFF',
  secondaryHeader: '#5B3FE0',
  trialBg: '#7C5CFF',
  trialBgSoft: '#F1ECFF',
  disabled: '#9E9EB3',
  hint: '#9E9EB3',
  card: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F7F5FE',         // Input bg, secondary chips
  surfaceMuted: '#F1ECFF',
  surfaceGlass: 'rgba(255, 255, 255, 0.72)',
  surfaceDark: '#0F0F1A',
  surfaceBright: '#F1ECFF',
  background: '#F4F2FB',          // Lavender-tinted canvas
  text: '#0F0F1A',               // Near-black, slightly cool
  textPrimary: '#0F0F1A',
  textSecondary: '#5B5B70',
  textTertiary: '#9E9EB3',
  textMuted: '#9E9EB3',
  textInverse: '#FFFFFF',
  textLight: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  border: '#ECE9F7',
  borderLight: '#F4F2FB',
  borderPrimary: '#D8CCFF',      // Focused input halo
  divider: '#ECE9F7',
  shadow: 'rgba(124, 92, 255, 0.10)',
  shadowSoft: 'rgba(15, 15, 26, 0.04)',
  shadowStrong: 'rgba(124, 92, 255, 0.28)',
  error: '#FF4D6D',
  danger: '#FF4D6D',
  dangerBg: '#FFE8EC',
  success: '#10C997',
  warning: '#FFB020',
  info: '#3B82F6',
  star: '#FFB020',
  discount: '#FF4D6D',
  discountBg: '#FFE8EC',
  discountTag: '#FF4D6D',
  notAvailable: '#9E9EB3',
  shimmerBase: '#ECE9F7',
  shimmerHighlight: '#F7F5FE',
  // Decorative gradients (matched to vendor app)
  sunsetStart: '#FF6B6B',
  sunsetEnd: '#FF4D6D',
  oceanStart: '#06B6D4',
  oceanEnd: '#3B82F6',
  // Category pastel backgrounds (retained for backward-compat with home screen)
  catYellow: '#FFF8E1',
  catMint: '#E0F7F0',
  catLavender: '#F3E8FF',
  catCream: '#FFF1D6',
  catPink: '#FFE4E6',
  catBlue: '#DBEAFE',
  catGreen: '#DCFCE7',
  catOrange: '#FFEDD5',
  successSoft: '#E6FAF3',
  warningSoft: '#FFF6E6',
  dangerSoft: '#FFE8EC',
  infoSoft: '#EFF6FF',
} as const;

// Dark theme colors — Aurora dark
export const DarkColors = {
  primary: '#9D86FF',
  primaryDark: '#7C5CFF',
  primaryLight: '#2A1F4D',
  primarySofter: '#1A1330',
  accent: '#22D3EE',
  accentSoft: '#0E2A33',
  accentForeground: '#67E8F9',
  primaryGradientStart: '#7C5CFF',
  primaryGradientEnd: '#C026D3',
  heroGradientStart: '#7C5CFF',
  heroGradientEnd: '#C026D3',
  accentGradientStart: '#22D3EE',
  accentGradientEnd: '#9D86FF',
  secondaryHeader: '#9D86FF',
  trialBg: '#7C5CFF',
  trialBgSoft: '#2A1F4D',
  disabled: '#7E7E96',
  hint: '#7E7E96',
  card: '#16161F',
  surface: '#16161F',
  surfaceAlt: '#1F1F2C',
  surfaceMuted: '#1F1F2C',
  surfaceGlass: 'rgba(22, 22, 31, 0.72)',
  surfaceDark: '#0A0A14',
  surfaceBright: '#1F1F2C',
  background: '#0A0A14',
  text: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#CFCFE0',
  textTertiary: '#7E7E96',
  textMuted: '#7E7E96',
  textInverse: '#0A0A14',
  textLight: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  border: '#26263A',
  borderLight: '#1F1F2C',
  borderPrimary: '#3D2E66',
  divider: '#26263A',
  shadow: '#000000',
  shadowSoft: 'rgba(0, 0, 0, 0.4)',
  shadowStrong: 'rgba(0, 0, 0, 0.6)',
  error: '#FF4D6D',
  danger: '#FF4D6D',
  dangerBg: '#3A0E1A',
  success: '#10C997',
  warning: '#FFB020',
  info: '#60A5FA',
  star: '#FFB020',
  discount: '#FF4D6D',
  discountBg: '#3A0E1A',
  discountTag: '#FF4D6D',
  notAvailable: '#7E7E96',
  shimmerBase: '#26263A',
  shimmerHighlight: '#1F1F2C',
  sunsetStart: '#FF6B6B',
  sunsetEnd: '#FF4D6D',
  oceanStart: '#22D3EE',
  oceanEnd: '#3B82F6',
  catYellow: '#3D341C',
  catMint: '#1C3D32',
  catLavender: '#2E1F3D',
  catCream: '#3D2E1C',
  catPink: '#3D1C20',
  catBlue: '#1C2A3D',
  catGreen: '#1C3D2A',
  catOrange: '#3D2A1C',
  successSoft: '#0D2B24',
  warningSoft: '#3A2A0E',
  dangerSoft: '#3A0E1A',
  infoSoft: '#0E1E3A',
} as const;

// Order status -> background color (Aurora-tinted)
export const StatusBgColor: Record<string, string> = {
  pending: 'rgba(255, 176, 32, 0.18)',
  accepted: 'rgba(124, 92, 255, 0.18)',
  confirmed: 'rgba(124, 92, 255, 0.18)',
  processing: 'rgba(6, 182, 212, 0.20)',
  ongoing: 'rgba(6, 182, 212, 0.25)',
  handover: 'rgba(6, 182, 212, 0.25)',
  picked_up: 'rgba(16, 201, 151, 0.22)',
  out_for_delivery: 'rgba(6, 182, 212, 0.30)',
  completed: 'rgba(16, 201, 151, 0.22)',
  delivered: 'rgba(16, 201, 151, 0.22)',
  settled: 'rgba(16, 201, 151, 0.30)',
  canceled: 'rgba(255, 77, 109, 0.18)',
  failed: 'rgba(255, 77, 109, 0.22)',
  approved: 'rgba(124, 92, 255, 0.30)',
  expired: 'rgba(158, 158, 179, 0.30)',
  running: 'rgba(124, 92, 255, 0.30)',
  denied: 'rgba(255, 77, 109, 0.25)',
  paused: '#5B3FE0',
  resumed: 'rgba(16, 201, 151, 0.30)',
  active: 'rgba(16, 201, 151, 0.22)',
  inactive: 'rgba(158, 158, 179, 0.30)',
};

// Order status -> text color (Aurora-tinted)
export const StatusTextColor: Record<string, string> = {
  pending: '#FFB020',
  accepted: '#7C5CFF',
  confirmed: '#7C5CFF',
  processing: '#06B6D4',
  ongoing: '#06B6D4',
  handover: '#06B6D4',
  picked_up: '#10C997',
  out_for_delivery: '#06B6D4',
  completed: '#10C997',
  delivered: '#10C997',
  settled: '#10C997',
  canceled: '#FF4D6D',
  failed: '#FF4D6D',
  approved: '#7C5CFF',
  expired: '#9E9EB3',
  running: '#7C5CFF',
  denied: '#FF4D6D',
  paused: '#5B3FE0',
  resumed: '#10C997',
  active: '#10C997',
  inactive: '#9E9EB3',
};

// Legacy compatibility — single Colors object (light defaults)
export const Colors = LightColors as {
  [K in keyof typeof LightColors]: string;
};

// Aurora spacing scale — matches vendor app
export const Spacing = {
  none: 0,
  xs: 4,
  extraSmall: 6,
  sm: 8,
  small: 10,
  md: 12,
  default: 16,
  lg: 16,
  large: 22,
  xl: 20,
  extraLarge: 28,
  xxl: 24,
  extraOverLarge: 34,
  xxxl: 32,
  extremeLarge: 44,
} as const;

// Aurora radii — matches vendor app
export const Radius = {
  none: 0,
  xs: 5,
  extraSmall: 6,
  sm: 8,
  small: 10,
  md: 10,
  default: 14,
  lg: 15,
  medium: 18,
  large: 22,
  xl: 20,
  extraLarge: 28,
  xxl: 28,
  extraOverLarge: 32,
  huge: 40,
  pill: 999,
  circular: 999,
} as const;

// Aurora font sizes — matches vendor app
export const FontSize = {
  xs: 8,
  extraSmall: 11,
  sm: 10,
  small: 13,
  md: 12,
  default: 14,
  medium: 17,
  lg: 16,
  large: 20,
  xl: 18,
  extraLarge: 24,
  xxl: 20,
  overLarge: 30,
  xxxl: 24,
  huge: 36,
  display: 44,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

// Aurora layout — matches vendor app
export const BottomTabHeight = 72;
export const HeaderHeight = 60;
export const MaxContentWidth = 480;
export const ButtonHeight = 54;
export const InputHeight = 54;

export function getThemeColors(mode: ThemeMode): typeof LightColors {
  return (mode === 'dark' ? DarkColors : LightColors) as typeof LightColors;
}
