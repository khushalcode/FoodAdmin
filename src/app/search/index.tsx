// Search screen — global product/vendor search.

import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, EmptyState } from '@/components/ui/index';
import { fetchProducts, fetchVendors } from '@/lib/data';
import { CATEGORIES } from '@/constants/categories';
import type { Vendor, Product } from '@/types';

const RECENT_KEY = 'customar.recent-searches';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ products: Product[]; vendors: Vendor[] }>({ products: [], vendors: [] });
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>(['grocery', 'pharmacy', 'food']);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (q: string) => {
    if (!q.trim()) {
      setResults({ products: [], vendors: [] });
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    const [p, v] = await Promise.all([
      fetchProducts({ search: q }),
      fetchVendors(),
    ]);
    setResults({
      products: p,
      vendors: v.filter((vendor) => vendor.name.toLowerCase().includes(q.toLowerCase()) || (vendor.tagline ?? '').toLowerCase().includes(q.toLowerCase())),
    });
    setLoading(false);
    setRecent((prev) => [q, ...prev.filter((x) => x !== q)].slice(0, 8));
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={Colors.textTertiary} />
          <TextInput
            placeholder="Search for products, stores..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch(query)}
            returnKeyType="search"
            autoFocus
            placeholderTextColor={Colors.textTertiary}
            style={styles.input}
          />
          {query ? (
            <Pressable onPress={() => { setQuery(''); setResults({ products: [], vendors: [] }); setHasSearched(false); }} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {!hasSearched ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <View style={styles.recentRow}>
              {recent.map((r, i) => (
                <Pressable key={i} style={styles.recentChip} onPress={() => { setQuery(r); handleSearch(r); }}>
                  <Text style={styles.recentText}>{r}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
            <View style={styles.catRow}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c.key}
                  style={[styles.catCard, { backgroundColor: c.bg }]}
                  onPress={() => router.push(`/category/${c.key}`)}
                >
                  <MaterialCommunityIcons name={c.icon as any} size={28} color={c.color} />
                  <Text style={styles.catLabel}>{c.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xxxl }} />
          ) : (
            <>
              {results.vendors.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Stores ({results.vendors.length})</Text>
                  {results.vendors.map((v) => (
                    <Pressable
                      key={v.id}
                      style={styles.resultRow}
                      onPress={() => router.push(`/vendor/${v.id}`)}
                    >
                      <View style={styles.resultIcon}>
                        <MaterialCommunityIcons name="store-outline" size={20} color={Colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.resultName}>{v.name}</Text>
                        <Text style={styles.resultMeta}>{v.tagline}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                    </Pressable>
                  ))}
                </View>
              )}

              {results.products.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Products ({results.products.length})</Text>
                  {results.products.map((p) => (
                    <Pressable
                      key={p.id}
                      style={styles.resultRow}
                      onPress={() => router.push(`/product/${p.id}`)}
                    >
                      <View style={styles.resultIcon}>
                        <MaterialCommunityIcons name="package-variant" size={20} color={Colors.textSecondary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.resultName}>{p.name}</Text>
                        <Text style={styles.resultMeta}>${p.price.toFixed(2)} · {p.unit}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                    </Pressable>
                  ))}
                </View>
              )}

              {results.products.length === 0 && results.vendors.length === 0 && (
                <EmptyState
                  icon="magnify"
                  title="No results found"
                  subtitle={`We couldn't find anything for "${query}". Try a different search term.`}
                />
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  recentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  recentChip: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  recentText: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  catRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  catCard: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  catLabel: {
    fontSize: FontSize.xs,
    color: Colors.text,
    fontWeight: FontWeight.semibold,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  resultMeta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
