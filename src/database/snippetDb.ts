import * as SQLite from 'expo-sqlite';
import type { Snippet, SnippetInput } from '@/types';

const DB_NAME = 'devsnippets.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbInstance;
}

export async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS snippets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      code TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'JavaScript',
      tags TEXT NOT NULL DEFAULT '',
      isFavorite INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      aiExplanation TEXT
    );
  `);
}

export async function getAllSnippets(db: SQLite.SQLiteDatabase): Promise<Snippet[]> {
  return db.getAllAsync<Snippet>('SELECT * FROM snippets ORDER BY updatedAt DESC');
}

export async function getSnippetById(db: SQLite.SQLiteDatabase, id: number): Promise<Snippet | null> {
  return db.getFirstAsync<Snippet>('SELECT * FROM snippets WHERE id = ?', id);
}

export async function searchSnippets(db: SQLite.SQLiteDatabase, query: string): Promise<Snippet[]> {
  const q = `%${query}%`;
  return db.getAllAsync<Snippet>(
    'SELECT * FROM snippets WHERE title LIKE ? OR code LIKE ? OR tags LIKE ? OR language LIKE ? ORDER BY updatedAt DESC',
    [q, q, q, q]
  );
}

export async function getFavoriteSnippets(db: SQLite.SQLiteDatabase): Promise<Snippet[]> {
  return db.getAllAsync<Snippet>('SELECT * FROM snippets WHERE isFavorite = 1 ORDER BY updatedAt DESC');
}

export async function createSnippet(db: SQLite.SQLiteDatabase, input: SnippetInput): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO snippets (title, code, language, tags) VALUES (?, ?, ?, ?)',
    [input.title, input.code, input.language, input.tags]
  );
  return result.lastInsertRowId;
}

export async function updateSnippet(
  db: SQLite.SQLiteDatabase,
  id: number,
  input: SnippetInput
): Promise<void> {
  await db.runAsync(
    'UPDATE snippets SET title = ?, code = ?, language = ?, tags = ?, updatedAt = datetime("now") WHERE id = ?',
    [input.title, input.code, input.language, input.tags, id]
  );
}

export async function deleteSnippet(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM snippets WHERE id = ?', id);
}

export async function toggleFavorite(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync(
    'UPDATE snippets SET isFavorite = CASE WHEN isFavorite = 1 THEN 0 ELSE 1 END, updatedAt = datetime("now") WHERE id = ?',
    id
  );
}

export async function saveAiExplanation(
  db: SQLite.SQLiteDatabase,
  id: number,
  explanation: string
): Promise<void> {
  await db.runAsync(
    'UPDATE snippets SET aiExplanation = ?, updatedAt = datetime("now") WHERE id = ?',
    [explanation, id]
  );
}
