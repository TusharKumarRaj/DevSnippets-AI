import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { getFavoriteSnippets, toggleFavorite } from '@/database/snippetDb';
import SnippetCard from '@/components/SnippetCard';
import EmptyState from '@/components/EmptyState';
import CodePattern from '@/components/CodePattern';
import type { Snippet } from '@/types';

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const router = useRouter();
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  const loadFavorites = useCallback(async () => {
    const data = await getFavoriteSnippets(db);
    setSnippets(data);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const handleToggleFav = async (id: number) => {
    await toggleFavorite(db, id);
    loadFavorites();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.hero, { backgroundColor: colors.background }]}>
        <CodePattern />
        <View style={styles.heroContent}>
          <Text style={[styles.heroTitle, { color: colors.primary }]}>
            Your{'\n'}
            <Text style={{ color: colors.accent }}>Favorites</Text>
          </Text>
          <Text style={[styles.count, { color: colors.textMuted }]}>{snippets.length} snippets saved</Text>
        </View>
      </View>

      <FlatList
        data={snippets}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <SnippetCard
            snippet={item}
            onPress={() => router.push(`/snippet/${item.id}`)}
            onToggleFavorite={() => handleToggleFav(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="No favorites yet"
            subtitle="Tap the heart icon on any snippet to add it here"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { height: 140, justifyContent: 'center', overflow: 'hidden' },
  heroContent: { paddingHorizontal: 24, zIndex: 1 },
  heroTitle: { fontSize: 38, fontWeight: '900', lineHeight: 44, letterSpacing: -1 },
  count: { fontSize: 14, marginTop: 6, fontWeight: '500' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
});
