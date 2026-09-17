// Root layout — wraps everything in providers.
// Ported from Flutter lib/main.dart (which sets up GetX DI, theme, splash, localization).

import { Stack } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { useTheme } from '@/store/theme';
import { AuthProvider } from '@/store/auth';
import { CartProvider } from '@/store/cart';
import { FavoritesProvider } from '@/store/favorites';
import { OrderProvider } from '@/store/orders';
import { NotificationProvider } from '@/store/notifications';
import { WalletProvider } from '@/store/wallet';
import { LoyaltyProvider } from '@/store/loyalty';
import { CouponProvider } from '@/store/coupons';
import { I18nProvider } from '@/constants/i18n';
import { ThemeProvider } from '@/store/theme';

SplashScreen.preventAutoHideAsync();

function InnerLayout() {
  const { mode } = useTheme();
  return <ExpoStatusBar style={mode === 'dark' ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  useEffect(() => {
    // Preload DMSans fonts (Flutter uses these via pubspec.yaml fonts: family: DMSans)
    (async () => {
      try {
        await Font.loadAsync({
          DMSans: require('@/assets/fonts/DMSans-Regular.ttf'),
          'DMSans-Regular': require('@/assets/fonts/DMSans-Regular.ttf'),
          'DMSans-Medium': require('@/assets/fonts/DMSans-Medium.ttf'),
          'DMSans-SemiBold': require('@/assets/fonts/DMSans-SemiBold.ttf'),
          'DMSans-Bold': require('@/assets/fonts/DMSans-Bold.ttf'),
        });
      } catch (e) {
        // Fonts optional — fall back to system
      }
      // Hide splash after fonts (or fallback) load
      const t = setTimeout(() => SplashScreen.hideAsync(), 200);
      return () => clearTimeout(t);
    })();
  }, []);

  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <OrderProvider>
                <NotificationProvider>
                  <WalletProvider>
                    <LoyaltyProvider>
                      <CouponProvider>
                        <InnerLayout />
                        <Stack
                          screenOptions={{
                            headerShown: false,
                            animation: 'slide_from_right',
                          }}
                        >
                          {/* Root / splash / language / onboarding */}
                          <Stack.Screen name="index" />
                          <Stack.Screen name="onboarding/welcome" />
                          <Stack.Screen name="auth/index" />
                          <Stack.Screen name="language/index" />

                          {/* Tabs */}
                          <Stack.Screen name="(tabs)" />

                          {/* Browse */}
                          <Stack.Screen name="category/[category]" />
                          <Stack.Screen name="vendor/[id]" />
                          <Stack.Screen name="product/[id]" />
                          <Stack.Screen name="search/index" />

                          {/* Cart + checkout */}
                          <Stack.Screen name="cart/index" />
                          <Stack.Screen name="checkout/index" />
                          <Stack.Screen name="order-success/index" />

                          {/* Orders */}
                          <Stack.Screen name="order/[id]" />
                          <Stack.Screen name="order/list" />

                          {/* Address */}
                          <Stack.Screen name="address-list/index" />
                          <Stack.Screen name="address-edit/index" />
                          <Stack.Screen name="address-edit/[id]" />

                          {/* Account */}
                          <Stack.Screen name="edit-profile/index" />
                          <Stack.Screen name="settings/index" />
                          <Stack.Screen name="notifications/index" />

                          {/* Wallet / Loyalty / Coupons */}
                          <Stack.Screen name="wallet/index" />
                          <Stack.Screen name="loyalty/index" />
                          <Stack.Screen name="coupon/index" />
                          <Stack.Screen name="coupon/list" />

                          {/* Refer & Earn */}
                          <Stack.Screen name="refer-earn/index" />

                          {/* Flash sale */}
                          <Stack.Screen name="flash-sale/index" />

                          {/* Support / chat */}
                          <Stack.Screen name="help/index" />
                          <Stack.Screen name="chat/index" />
                          <Stack.Screen name="chat/[conversationId]" />
                          <Stack.Screen name="about/index" />

                          {/* Module: Parcel */}
                          <Stack.Screen name="parcel/index" />
                          <Stack.Screen name="parcel/send" />

                          {/* Module: Ride-share / Rental */}
                          <Stack.Screen name="ride-share/index" />
                          <Stack.Screen name="ride-share/book" />

                          {/* Module: Rental */}
                          <Stack.Screen name="rental/index" />

                          {/* Module: Service */}
                          <Stack.Screen name="service/index" />
                          <Stack.Screen name="service/[id]" />

                          {/* Reels */}
                          <Stack.Screen name="reels/index" />

                          {/* Brands */}
                          <Stack.Screen name="brands/index" />

                          {/* Static pages */}
                          <Stack.Screen name="html/[type]" />

                          {/* Join as vendor / DM */}
                          <Stack.Screen name="vendor-register/index" />
                          <Stack.Screen name="delivery-register/index" />

                          {/* V4.0 additional screens */}
                          <Stack.Screen name="pro/index" />
                          <Stack.Screen name="interest/index" />
                          <Stack.Screen name="all-stores/index" />
                          <Stack.Screen name="popular-items/index" />
                          <Stack.Screen name="store-menu/index" />
                          <Stack.Screen name="campaigns/index" />
                        </Stack>
                      </CouponProvider>
                    </LoyaltyProvider>
                  </WalletProvider>
                </NotificationProvider>
              </OrderProvider>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
