import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/contexts/ThemeContext';
import { getSnippetById, toggleFavorite, deleteSnippet, saveAiExplanation } from '@/database/snippetDb';
import { explainCode } from '@/services/aiService';
import { shareSnippet, saveExportLocally } from '@/services/exportService';
import { saveScreenshot, getSnippetScreenshots } from '@/services/fileService';
import type { Snippet, LocalFile } from '@/types';

export default function SnippetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const router = useRouter();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [screenshots, setScreenshots] = useState<LocalFile[]>([]);
  const [showExport, setShowExport] = useState(false);

  const load = async () => {
    const data = await getSnippetById(db, Number(id));
    setSnippet(data);
    setLoading(false);
    if (data) setScreenshots(getSnippetScreenshots(data.id));
  };

  useEffect(() => { load(); }, [id]);

  const handleToggleFav = async () => {
    if (!snippet) return;
    await toggleFavorite(db, snippet.id);
    load();
  };

  const handleDelete = () => {
    Alert.alert('Delete Snippet', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteSnippet(db, Number(id)); router.back(); } },
    ]);
  };

  const handleExplain = async () => {
    if (!snippet) return;
    setAiLoading(true);
    try {
      const explanation = await explainCode(snippet.code, snippet.language);
      await saveAiExplanation(db, snippet.id, explanation);
      load();
    } catch (e: any) {
      Alert.alert('AI Error', e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAttachScreenshot = async () => {
    if (!snippet) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      saveScreenshot(snippet.id, result.assets[0].uri);
      setScreenshots(getSnippetScreenshots(snippet.id));
      Alert.alert('Done', 'Screenshot attached');
    }
  };

  const handleExport = async (format: 'txt' | 'js' | 'json') => {
    if (!snippet) return;
    setShowExport(false);
    try {
      await saveExportLocally(snippet, format);
      Alert.alert('Exported', `Saved as .${format} in DevSnippets/exports`);
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const handleShare = async (format: 'txt' | 'js' | 'json') => {
    if (!snippet) return;
    setShowExport(false);
    try { await shareSnippet(snippet, format); }
    catch (e: any) { Alert.alert('Error', e.message); }
  };

  if (loading || !snippet) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const tags = snippet.tags ? snippet.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.topActions}>
          <TouchableOpacity onPress={handleToggleFav} hitSlop={8}>
            <Ionicons name={snippet.isFavorite ? 'heart' : 'heart-outline'} size={24} color={snippet.isFavorite ? colors.accent : colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push(`/edit/${snippet.id}`)} hitSlop={8}>
            <Ionicons name="pencil" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={22} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>{snippet.title}</Text>

        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={[styles.langBadge, { backgroundColor: colors.primary + '18' }]}>
            <Text style={[styles.langText, { color: colors.primary }]}>{snippet.language}</Text>
          </View>
          {tags.map((tag) => (
            <View key={tag} style={[styles.tagBadge, { backgroundColor: colors.accent + '15' }]}>
              <Text style={[styles.tagText, { color: colors.accent }]}>#{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.date, { color: colors.textMuted }]}>Created {new Date(snippet.createdAt).toLocaleDateString()}</Text>

        {/* Code block */}
        <View style={[styles.codeBlock, { backgroundColor: colors.codeBackground, borderColor: colors.border }]}>
          <Text style={[styles.codeText, { color: colors.text }]}>{snippet.code}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
            onPress={handleExplain}
            disabled={aiLoading}
          >
            {aiLoading
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Ionicons name="sparkles" size={16} color={colors.primary} />
            }
            <Text style={[styles.actionText, { color: colors.primary }]}>{aiLoading ? 'Thinking...' : 'AI Explain'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowExport(true)}
          >
            <Ionicons name="share-outline" size={16} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>Export</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleAttachScreenshot}
          >
            <Ionicons name="image-outline" size={16} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>Attach</Text>
          </TouchableOpacity>
        </View>

        {/* AI Explanation */}
        {snippet.aiExplanation ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>AI Explanation</Text>
            <View style={[styles.aiBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.aiText, { color: colors.textSecondary }]}>{snippet.aiExplanation}</Text>
            </View>
          </>
        ) : null}

        {screenshots.length > 0 && (
          <Text style={[styles.screenshotInfo, { color: colors.textMuted }]}>{screenshots.length} screenshot(s) attached</Text>
        )}
      </ScrollView>

      {/* Export modal */}
      <Modal visible={showExport} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowExport(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Export & Share</Text>
            {(['txt', 'js', 'json'] as const).map((fmt) => (
              <View key={fmt} style={[styles.exportRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.exportLabel, { color: colors.text }]}>.{fmt}</Text>
                <View style={styles.exportBtns}>
                  <TouchableOpacity style={[styles.exportBtn, { backgroundColor: colors.primary + '15' }]} onPress={() => handleExport(fmt)}>
                    <Text style={[styles.exportBtnText, { color: colors.primary }]}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.exportBtn, { backgroundColor: colors.accent + '15' }]} onPress={() => handleShare(fmt)}>
                    <Text style={[styles.exportBtnText, { color: colors.accent }]}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  topActions: { flexDirection: 'row', gap: 18 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '900', marginBottom: 12, letterSpacing: -0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  langBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  langText: { fontSize: 13, fontWeight: '800' },
  tagBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7 },
  tagText: { fontSize: 12, fontWeight: '600' },
  date: { fontSize: 13, marginBottom: 16 },
  codeBlock: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 16 },
  codeText: { fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 20 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 6, borderWidth: 1 },
  actionText: { fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 12 },
  aiBox: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 16 },
  aiText: { fontSize: 14, lineHeight: 22 },
  screenshotInfo: { fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 30 },
  modalTitle: { fontSize: 18, fontWeight: '900', textAlign: 'center', paddingVertical: 18 },
  exportRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1 },
  exportLabel: { fontSize: 16, fontWeight: '700' },
  exportBtns: { flexDirection: 'row', gap: 10 },
  exportBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  exportBtnText: { fontSize: 13, fontWeight: '700' },
});
