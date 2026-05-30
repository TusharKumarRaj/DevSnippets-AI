import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { createSnippet } from '@/database/snippetDb';
import SnippetForm from '@/components/SnippetForm';
import type { SnippetInput } from '@/types';

export default function CreateScreen() {
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const router = useRouter();

  const handleSave = async (input: SnippetInput) => {
    await createSnippet(db, input);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <SnippetForm onSave={handleSave} onCancel={() => router.back()} />
    </SafeAreaView>
  );
}
