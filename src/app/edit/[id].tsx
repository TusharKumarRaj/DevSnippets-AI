import { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { getSnippetById, updateSnippet } from '@/database/snippetDb';
import SnippetForm from '@/components/SnippetForm';
import type { Snippet, SnippetInput } from '@/types';

export default function EditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const router = useRouter();
  const [snippet, setSnippet] = useState<Snippet | null>(null);

  useEffect(() => {
    getSnippetById(db, Number(id)).then(setSnippet);
  }, [id]);

  const handleSave = async (input: SnippetInput) => {
    await updateSnippet(db, Number(id), input);
    router.back();
  };

  if (!snippet) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <SnippetForm initial={snippet} onSave={handleSave} onCancel={() => router.back()} />
    </SafeAreaView>
  );
}
