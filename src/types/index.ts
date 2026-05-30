export interface Snippet {
  id: number;
  title: string;
  code: string;
  language: string;
  tags: string;
  isFavorite: number; // 0 or 1 for SQLite boolean
  createdAt: string;
  updatedAt: string;
  aiExplanation?: string;
}

export interface SnippetInput {
  title: string;
  code: string;
  language: string;
  tags: string;
}

export interface LocalFile {
  name: string;
  uri: string;
  isDirectory: boolean;
  size: number | null;
}

export type ThemeMode = 'dark' | 'light';

export const LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'C#',
  'Go',
  'Rust',
  'Swift',
  'Kotlin',
  'Ruby',
  'PHP',
  'HTML',
  'CSS',
  'SQL',
  'Shell',
  'Dart',
  'R',
  'Lua',
  'Other',
] as const;
