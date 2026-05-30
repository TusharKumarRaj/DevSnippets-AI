import { Stack } from 'expo-router';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { Suspense } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { initDatabase } from '@/database/snippetDb';

async function migrateDb(db: SQLiteDatabase) {
  await initDatabase(db);
}

function Loading() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8E4F0' }}>
      <ActivityIndicator size="large" color="#3D3566" />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Suspense fallback={<Loading />}>
          <SQLiteProvider databaseName="devsnippets.db" onInit={migrateDb} useSuspense>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="create" options={{ presentation: 'modal' }} />
              <Stack.Screen name="snippet/[id]" />
              <Stack.Screen name="edit/[id]" options={{ presentation: 'modal' }} />
            </Stack>
          </SQLiteProvider>
        </Suspense>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
