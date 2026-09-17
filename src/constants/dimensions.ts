// Dimensions — ported from Flutter lib/util/dimensions.dart
// Used for spacing, font sizes, radii across the app.

import { Dimensions as RNDimensions } from 'react-native';

const screenWidth = RNDimensions.get('window').width;
const isWeb = screenWidth >= 1300;

export const Dimensions = {
  // Font sizes
  fontSizeOverSmall: isWeb ? 10 : 8,
  fontSizeExtraSmall: isWeb ? 12 : 10,
  fontSizeSmall: isWeb ? 14 : 12,
  fontSizeDefault: isWeb ? 16 : 14,
  fontSizeLarge: isWeb ? 18 : 16,
  fontSizeExtraLarge: isWeb ? 20 : 18,
  fontSizeExtremeLarge: isWeb ? 22 : 20,
  fontSizeOverLarge: isWeb ? 26 : 24,

  // Padding sizes
  paddingSizeExtraSmall: 5,
  paddingSizeSmall: 10,
  paddingSizeDefault: 15,
  paddingSizeLarge: 20,
  paddingSizeExtraLarge: 24,
  paddingSizeExtremeLarge: 30,
  paddingSizeExtraOverLarge: 35,

  // Radii
  radiusSmall: 5,
  radiusMedium: 8,
  radiusDefault: 10,
  radiusLarge: 15,
  radiusExtraLarge: 20,

  // Misc
  webMaxWidth: 1170,
  messageInputLength: 1000,
  pickMapIconSize: 100,
} as const;

export type DimensionsType = typeof Dimensions;
