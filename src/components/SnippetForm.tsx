import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { LANGUAGES } from '@/types';
import type { SnippetInput, Snippet } from '@/types';

interface Props {
  initial?: Snippet;
  onSave: (input: SnippetInput) => void;
  onCancel: () => void;
}

export default function SnippetForm({ initial, onSave, onCancel }: Props) {
  const { colors } = useTheme();
  const [title, setTitle] = useState(initial?.title || '');
  const [code, setCode] = useState(initial?.code || '');
  const [language, setLanguage] = useState(initial?.language || 'JavaScript');
  const [tags, setTags] = useState(initial?.tags || '');
  const [showLangPicker, setShowLangPicker] = useState(false);

  const handleSave = () => {
    if (!title.trim()) return Alert.alert('Error', 'Title is required');
    if (!code.trim()) return Alert.alert('Error', 'Code content is required');
    onSave({ title: title.trim(), code, language, tags: tags.trim() });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} hitSlop={8} style={[styles.closeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="close" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{initial ? 'Edit Snippet' : 'New Snippet'}</Text>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <View>
          <Text style={[styles.label, { color: colors.textMuted }]}>Title</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Debounce Hook"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View>
          <Text style={[styles.label, { color: colors.textMuted }]}>Language</Text>
          <TouchableOpacity
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
            onPress={() => setShowLangPicker(true)}
          >
            <Text style={{ fontSize: 15, color: colors.text, fontWeight: '600' }}>{language}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View>
          <Text style={[styles.label, { color: colors.textMuted }]}>Code</Text>
          <TextInput
            style={[styles.codeInput, { backgroundColor: colors.codeBackground, borderColor: colors.border, color: colors.text }]}
            value={code}
            onChangeText={setCode}
            placeholder="Paste your code here..."
            placeholderTextColor={colors.textMuted}
            multiline
            scrollEnabled={false}
          />
        </View>

        <View>
          <Text style={[styles.label, { color: colors.textMuted }]}>Tags (comma separated)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={tags}
            onChangeText={setTags}
            placeholder="e.g. react, hooks, utility"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </ScrollView>

      <Modal visible={showLangPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLangPicker(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text, borderBottomColor: colors.border }]}>Select Language</Text>
            <ScrollView>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.langOption, { borderBottomColor: colors.border }, language === lang && { backgroundColor: colors.primary + '12' }]}
                  onPress={() => { setLanguage(lang); setShowLangPicker(false); }}
                >
                  <Text style={[styles.langOptionText, { color: language === lang ? colors.primary : colors.text }, language === lang && { fontWeight: '700' }]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  closeBtn: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  saveBtn: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 10 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  form: { paddingHorizontal: 20, gap: 18, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 15 },
  codeInput: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 14, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', minHeight: 200, textAlignVertical: 'top' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%', paddingBottom: 30 },
  modalTitle: { fontSize: 17, fontWeight: '800', textAlign: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  langOption: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1 },
  langOptionText: { fontSize: 15 },
});
