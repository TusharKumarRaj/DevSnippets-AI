import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import type { Snippet } from '@/types';

const LANG_COLORS: Record<string, string> = {
  JavaScript: '#F7DF1E',
  TypeScript: '#3178C6',
  Python: '#3776AB',
  Java: '#ED8B00',
  'C++': '#00599C',
  'C#': '#239120',
  Go: '#00ADD8',
  Rust: '#CE422B',
  Swift: '#FA7343',
  Kotlin: '#7F52FF',
  Ruby: '#CC342D',
  PHP: '#777BB4',
  HTML: '#E34F26',
  CSS: '#1572B6',
  SQL: '#4479A1',
  Shell: '#4EAA25',
  Dart: '#0175C2',
  Other: '#888',
};

export default function SnippetCard({ snippet, onPress, onToggleFavorite }: {
  snippet: Snippet;
  onPress: () => void;
  onToggleFavorite: () => void;
}) {
  const { colors } = useTheme();
  const langColor = LANG_COLORS[snippet.language] || LANG_COLORS.Other;
  const tags = snippet.tags ? snippet.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{snippet.title}</Text>
        <TouchableOpacity onPress={onToggleFavorite} hitSlop={8}>
          <Ionicons
            name={snippet.isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={snippet.isFavorite ? colors.accent : colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      <View style={[styles.codePreview, { backgroundColor: colors.codeBackground }]}>
        <Text style={[styles.codeText, { color: colors.textSecondary }]} numberOfLines={3}>{snippet.code}</Text>
      </View>

      <View style={styles.bottomRow}>
        <View style={[styles.langBadge, { backgroundColor: langColor + '18' }]}>
          <View style={[styles.langDot, { backgroundColor: langColor }]} />
          <Text style={[styles.langText, { color: langColor }]}>{snippet.language}</Text>
        </View>
        <View style={styles.tagsRow}>
          {tags.slice(0, 3).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: colors.primary + '12' }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>#{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  title: { fontSize: 17, fontWeight: '800', flex: 1, marginRight: 8 },
  codePreview: { borderRadius: 12, padding: 12, marginBottom: 12 },
  codeText: { fontSize: 12, fontFamily: 'monospace' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  langBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  langDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  langText: { fontSize: 12, fontWeight: '700' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1, marginLeft: 10, justifyContent: 'flex-end' },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: '600' },
});
