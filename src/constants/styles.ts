// Styles — ported from Flutter lib/util/styles.dart.
// Text style presets + shadow helpers, using DMSans family.

import { TextStyle, ViewStyle } from 'react-native';
import { FontSize, FontWeight, LightColors as DefaultColors } from './theme';

const FONT = 'DMSans';

export const Typography: Record<string, TextStyle> = {
  overSmallRegular: { fontFamily: FONT, fontWeight: FontWeight.regular, fontSize: FontSize.xs },
  overSmallMedium: { fontFamily: FONT, fontWeight: FontWeight.medium, fontSize: FontSize.xs },
  extraSmallRegular: { fontFamily: FONT, fontWeight: FontWeight.regular, fontSize: FontSize.sm },
  extraSmallMedium: { fontFamily: FONT, fontWeight: FontWeight.medium, fontSize: FontSize.sm },
  smallRegular: { fontFamily: FONT, fontWeight: FontWeight.regular, fontSize: FontSize.md },
  smallMedium: { fontFamily: FONT, fontWeight: FontWeight.medium, fontSize: FontSize.md },
  smallSemiBold: { fontFamily: FONT, fontWeight: FontWeight.semibold, fontSize: FontSize.md },
  smallBold: { fontFamily: FONT, fontWeight: FontWeight.bold, fontSize: FontSize.md },
  defaultRegular: { fontFamily: FONT, fontWeight: FontWeight.regular, fontSize: FontSize.default },
  defaultMedium: { fontFamily: FONT, fontWeight: FontWeight.medium, fontSize: FontSize.default },
  defaultSemiBold: { fontFamily: FONT, fontWeight: FontWeight.semibold, fontSize: FontSize.default, letterSpacing: -0.3, lineHeight: 16.8 },
  defaultBold: { fontFamily: FONT, fontWeight: FontWeight.bold, fontSize: FontSize.default, letterSpacing: -0.5 },
  defaultBlack: { fontFamily: FONT, fontWeight: FontWeight.black, fontSize: FontSize.default },
  largeRegular: { fontFamily: FONT, fontWeight: FontWeight.regular, fontSize: FontSize.lg },
  largeMedium: { fontFamily: FONT, fontWeight: FontWeight.medium, fontSize: FontSize.lg },
  largeSemiBold: { fontFamily: FONT, fontWeight: FontWeight.semibold, fontSize: FontSize.lg },
  largeBold: { fontFamily: FONT, fontWeight: FontWeight.bold, fontSize: FontSize.lg },
  extraLargeRegular: { fontFamily: FONT, fontWeight: FontWeight.regular, fontSize: FontSize.xl },
  extraLargeMedium: { fontFamily: FONT, fontWeight: FontWeight.medium, fontSize: FontSize.xl },
  extraLargeSemiBold: { fontFamily: FONT, fontWeight: FontWeight.semibold, fontSize: FontSize.xl },
  extraLargeBold: { fontFamily: FONT, fontWeight: FontWeight.bold, fontSize: FontSize.xl },
  extremeLargeBold: { fontFamily: FONT, fontWeight: FontWeight.bold, fontSize: FontSize.xxl },
  overLargeBold: { fontFamily: FONT, fontWeight: FontWeight.bold, fontSize: FontSize.xxxl },
};

// Card / search box shadows (Flutter: cardShadow, searchBoxShadow, lightShadow, shadow)
export const CardShadow: ViewStyle = {
  shadowColor: '#A8A8EA',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.13,
  shadowRadius: 2,
  elevation: 2,
};

export const SearchBoxShadow: ViewStyle = {
  shadowColor: '#8F94FB',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.13,
  shadowRadius: 5,
  elevation: 3,
};

export const LightShadow: ViewStyle = {
  shadowColor: '#D6D8E6',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.13,
  shadowRadius: 3,
  elevation: 1,
};

export const DefaultShadow: ViewStyle = {
  shadowColor: '#9E9E9E',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.1,
  shadowRadius: 1,
  elevation: 1,
};

// Rider container decoration (Flutter riderContainerDecoration)
export const RiderContainerStyle: ViewStyle = {
  borderRadius: 5,
  backgroundColor: `${DefaultColors.primary}1A`, // 10% alpha
};
