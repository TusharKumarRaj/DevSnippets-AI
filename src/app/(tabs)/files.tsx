import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import * as fileService from '@/services/fileService';
import CodePattern from '@/components/CodePattern';
import type { LocalFile } from '@/types';

export default function FilesScreen() {
  const { colors } = useTheme();
  const [path, setPath] = useState('');
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState('');

  const loadFiles = useCallback(() => {
    fileService.ensureAppRoot();
    const items = fileService.listDirectory(path);
    setFiles(items);
  }, [path]);

  useFocusEffect(
    useCallback(() => {
      loadFiles();
    }, [loadFiles])
  );

  const goBack = () => {
    const parts = path.split('/').filter(Boolean);
    parts.pop();
    setPath(parts.join('/'));
  };

  const openItem = (item: LocalFile) => {
    if (item.isDirectory) {
      setPath(path ? `${path}/${item.name}` : item.name);
    } else {
      try {
        const content = fileService.readFile(item.uri);
        Alert.alert(item.name, content.substring(0, 1000) + (content.length > 1000 ? '\n...(truncated)' : ''));
      } catch {
        Alert.alert('Error', 'Cannot read this file');
      }
    }
  };

  const handleDelete = (item: LocalFile) => {
    Alert.alert('Delete', `Delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => { fileService.deleteFileOrDir(item.uri, item.isDirectory); loadFiles(); },
      },
    ]);
  };

  const handleCreateFolder = () => {
    if (!folderName.trim()) return;
    try {
      fileService.createFolder(path, folderName.trim());
      setFolderName('');
      setShowNewFolder(false);
      loadFiles();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const formatSize = (size: number | null) => {
    if (size === null) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.background }]}>
        <CodePattern />
        <View style={styles.heroContent}>
          <Text style={[styles.heroTitle, { color: colors.primary }]}>
            File{'\n'}
            <Text style={{ color: colors.accent }}>Manager</Text>
          </Text>
        </View>
      </View>

      {/* Path + toolbar */}
      <View style={styles.pathRow}>
        {path !== '' && (
          <TouchableOpacity onPress={goBack} hitSlop={8} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="arrow-back" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
        <Text style={[styles.pathText, { color: colors.textSecondary }]} numberOfLines={1}>
          /{path || 'DevSnippets'}
        </Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => setShowNewFolder(true)}>
          <Ionicons name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* File list */}
      <FlatList
        data={files}
        keyExtractor={(item) => item.uri}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="folder-open-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Folder is empty</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.fileItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => openItem(item)}
            onLongPress={() => handleDelete(item)}
          >
            <View style={[styles.fileIcon, { backgroundColor: item.isDirectory ? colors.accent + '18' : colors.primary + '18' }]}>
              <Ionicons
                name={item.isDirectory ? 'folder' : 'document-text'}
                size={22}
                color={item.isDirectory ? colors.accent : colors.primary}
              />
            </View>
            <View style={styles.fileInfo}>
              <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.fileMeta, { color: colors.textMuted }]}>
                {item.isDirectory ? 'Folder' : formatSize(item.size)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={8}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* New Folder Modal */}
      <Modal visible={showNewFolder} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Folder</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={folderName}
              onChangeText={setFolderName}
              placeholder="Folder name"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setShowNewFolder(false); setFolderName(''); }}>
                <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalCreateBtn, { backgroundColor: colors.primary }]} onPress={handleCreateFolder}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { height: 130, justifyContent: 'center', overflow: 'hidden' },
  heroContent: { paddingHorizontal: 24, zIndex: 1 },
  heroTitle: { fontSize: 36, fontWeight: '900', lineHeight: 42, letterSpacing: -1 },
  pathRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, gap: 10 },
  pathText: { flex: 1, fontSize: 14, fontWeight: '500' },
  backBtn: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  addBtn: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { marginTop: 12, fontSize: 14 },
  fileItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1 },
  fileIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  fileInfo: { flex: 1, marginLeft: 12 },
  fileName: { fontSize: 15, fontWeight: '700' },
  fileMeta: { fontSize: 12, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 40 },
  modalContent: { borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  modalInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 16 },
  modalRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  modalCreateBtn: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 10 },
});
