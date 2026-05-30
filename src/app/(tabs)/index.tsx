import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { getAllSnippets, searchSnippets, toggleFavorite } from '@/database/snippetDb';
import SnippetCard from '@/components/SnippetCard';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';
import CodePattern from '@/components/CodePattern';
import type { Snippet } from '@/types';

export default function HomeScreen() {
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const router = useRouter();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [search, setSearch] = useState('');

  const loadSnippets = useCallback(async () => {
    const data = search.trim()
      ? await searchSnippets(db, search.trim())
      : await getAllSnippets(db);
    setSnippets(data);
  }, [db, search]);

  useFocusEffect(
    useCallback(() => {
      loadSnippets();
    }, [loadSnippets])
  );

  const handleToggleFav = async (id: number) => {
    await toggleFavorite(db, id);
    loadSnippets();
  };

  const totalSnippets = snippets.length;
  const favCount = snippets.filter((s) => s.isFavorite).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Hero header with pattern background */}
      <View style={[styles.hero, { backgroundColor: colors.background }]}>
        <CodePattern />
        <View style={styles.heroContent}>
          <Text style={[styles.heroTitle, { color: colors.primary }]}>
            Dev{'\n'}
            <Text style={{ color: colors.accent }}>Snippets</Text>
            {'\n'}AI
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <SearchBar value={search} onChangeText={setSearch} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{totalSnippets}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Snippets</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.accent }]}>{favCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Favorites</Text>
        </View>
      </View>

      {/* Snippet list */}
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
            icon="code-slash-outline"
            title={search ? 'No results found' : 'No snippets yet'}
            subtitle={search ? 'Try a different search term' : 'Tap + to create your first code snippet'}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/create')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 180,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroContent: {
    paddingHorizontal: 24,
    zIndex: 1,
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 50,
    letterSpacing: -1,
  },
  searchRow: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 14,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});
