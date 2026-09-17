// (tabs) layout — manages the 4 tab screens + shows BottomNav.
// Tab navigation isn't done with Expo Router's <Tabs> because the design
// uses a custom floating pill bottom nav. Instead, we manually switch
// between screens.

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { BottomNav } from '@/components/ui/bottom-nav';
import { OffersScreen } from '@/app/(tabs)/offers';
import { OrdersScreen } from '@/app/(tabs)/orders';
import { FavouriteScreen } from '@/app/(tabs)/favourite';
import { ProfileScreen } from '@/app/(tabs)/profile';
import { useAuth } from '@/store/auth';
import { useEffect } from 'react';

type TabKey = 'home' | 'offers' | 'orders' | 'favourite' | 'profile';

export default function TabsLayout() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [active, setActive] = useState<TabKey>('home');

  // If not authenticated, redirect to onboarding
  useEffect(() => {
    if (!session.user && !loading) {
      router.replace('/');
    }
  }, [session.user, loading]);

  return (
    <View style={styles.container}>
      {/* Home screen content */}
      {active === 'home' && <HomeTab onNavigate={setActive} />}
      {active === 'offers' && <OffersTab onNavigate={setActive} />}
      {active === 'orders' && <OrdersTab onNavigate={setActive} />}
      {active === 'favourite' && <FavouriteTab onNavigate={setActive} />}
      {active === 'profile' && <ProfileTab onNavigate={setActive} />}

      <BottomNav
        active={active === 'home' ? 'offers' : (active as any)}
        onNavigate={(key) => setActive(key as TabKey)}
      />
    </View>
  );
}

// Wrappers that pass props
function HomeTab({ onNavigate }: { onNavigate: (k: TabKey) => void }) {
  return <HomeScreen onTabNavigate={onNavigate} />;
}
function OffersTab({ onNavigate }: { onNavigate: (k: TabKey) => void }) {
  return <OffersScreen onTabNavigate={onNavigate} />;
}
function OrdersTab({ onNavigate }: { onNavigate: (k: TabKey) => void }) {
  return <OrdersScreen onTabNavigate={onNavigate} />;
}
function FavouriteTab({ onNavigate }: { onNavigate: (k: TabKey) => void }) {
  return <FavouriteScreen onTabNavigate={onNavigate} />;
}
function ProfileTab({ onNavigate }: { onNavigate: (k: TabKey) => void }) {
  return <ProfileScreen onTabNavigate={onNavigate} />;
}

import { HomeScreen } from '@/app/(tabs)/home';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
