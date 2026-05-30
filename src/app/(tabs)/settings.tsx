import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Switch, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import * as aiService from '@/services/aiService';
import CodePattern from '@/components/CodePattern';
import type { AiProvider } from '@/services/aiService';

export default function SettingsScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState('');
  const [provider, setProvider] = useState<AiProvider>('gemini');
  const [showKeyInput, setShowKeyInput] = useState(false);

  useEffect(() => {
    aiService.getApiKey().then((key) => {
      if (key) setMaskedKey('••••••••' + key.slice(-4));
    });
    aiService.getProvider().then(setProvider);
  }, []);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) return Alert.alert('Error', 'Please enter an API key');
    await aiService.setApiKey(apiKey.trim());
    setMaskedKey('••••••••' + apiKey.trim().slice(-4));
    setApiKey('');
    setShowKeyInput(false);
    Alert.alert('Saved', 'API key stored securely');
  };

  const handleDeleteKey = () => {
    Alert.alert('Delete API Key', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await aiService.deleteApiKey(); setMaskedKey(''); },
      },
    ]);
  };

  const handleProviderChange = async (p: AiProvider) => {
    setProvider(p);
    await aiService.setProvider(p);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.background }]}>
        <CodePattern />
        <View style={styles.heroContent}>
          <Text style={[styles.heroTitle, { color: colors.primary }]}>
            App{'\n'}
            <Text style={{ color: colors.accent }}>Settings</Text>
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Appearance */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Appearance</Text>
        <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.iconBox, { backgroundColor: colors.primary + '18' }]}>
            <Ionicons name={theme === 'dark' ? 'moon' : 'sunny'} size={20} color={colors.primary} />
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Dark Mode</Text>
            <Text style={[styles.rowSub, { color: colors.textMuted }]}>AsyncStorage</Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>

        {/* Provider */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>AI Provider</Text>
        <View style={styles.providerRow}>
          {(['gemini', 'openai'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.providerBtn,
                {
                  backgroundColor: provider === p ? colors.primary + '15' : colors.surface,
                  borderColor: provider === p ? colors.primary : colors.border,
                },
              ]}
              onPress={() => handleProviderChange(p)}
            >
              <Text style={[styles.providerText, { color: provider === p ? colors.primary : colors.textMuted }]}>
                {p === 'gemini' ? 'Gemini' : 'OpenAI'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* API Key */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>API Key</Text>
        <Text style={[styles.rowSub, { marginBottom: 12, paddingHorizontal: 4 }]}>Stored with SecureStore</Text>

        {maskedKey && !showKeyInput ? (
          <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.success + '18' }]}>
              <Ionicons name="key" size={20} color={colors.success} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{maskedKey}</Text>
              <Text style={[styles.rowSub, { color: colors.textMuted }]}>Key configured</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowKeyInput(true)} hitSlop={8}>
                <Ionicons name="pencil" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteKey} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder={`Enter ${provider === 'gemini' ? 'Gemini' : 'OpenAI'} API key`}
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
            />
            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSaveKey}>
                <Text style={styles.saveBtnText}>Save Key</Text>
              </TouchableOpacity>
              {maskedKey ? (
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => { setShowKeyInput(false); setApiKey(''); }}>
                  <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}

        {/* About */}
        <View style={styles.about}>
          <Text style={[styles.aboutText, { color: colors.textMuted }]}>DevSnippets AI v1.0.0</Text>
          <Text style={[styles.aboutText, { color: colors.textMuted }]}>Expo SDK 55 • React Native</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { height: 130, justifyContent: 'center', overflow: 'hidden' },
  heroContent: { paddingHorizontal: 24, zIndex: 1 },
  heroTitle: { fontSize: 36, fontWeight: '900', lineHeight: 42, letterSpacing: -1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12, marginTop: 8, paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, borderWidth: 1, marginBottom: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rowText: { flex: 1, marginLeft: 12 },
  rowLabel: { fontSize: 15, fontWeight: '700' },
  rowSub: { fontSize: 12, color: '#9490A8', marginTop: 2 },
  providerRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  providerBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1.5 },
  providerText: { fontSize: 15, fontWeight: '800' },
  input: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 15, marginBottom: 12 },
  btnRow: { flexDirection: 'row', gap: 10 },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  cancelBtnText: { fontWeight: '600', fontSize: 15 },
  about: { alignItems: 'center', paddingVertical: 30 },
  aboutText: { fontSize: 13, marginBottom: 4 },
});
