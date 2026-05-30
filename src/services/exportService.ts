import * as Sharing from 'expo-sharing';
import { File, Directory, Paths } from 'expo-file-system';
import type { Snippet } from '@/types';

const EXPORT_DIR = 'exports';

function getExportDir(): Directory {
  const dir = new Directory(Paths.cache, EXPORT_DIR);
  if (!dir.exists) dir.create();
  return dir;
}

export async function exportSnippetAsFile(
  snippet: Snippet,
  format: 'txt' | 'js' | 'json'
): Promise<string> {
  const dir = getExportDir();
  const sanitizedTitle = snippet.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${sanitizedTitle}.${format}`;

  let content: string;
  if (format === 'json') {
    content = JSON.stringify(
      {
        title: snippet.title,
        language: snippet.language,
        tags: snippet.tags.split(',').map((t) => t.trim()).filter(Boolean),
        code: snippet.code,
        createdAt: snippet.createdAt,
      },
      null,
      2
    );
  } else {
    content = `// Title: ${snippet.title}\n// Language: ${snippet.language}\n// Tags: ${snippet.tags}\n// Created: ${snippet.createdAt}\n\n${snippet.code}\n`;
  }

  const file = new File(dir, fileName);
  file.write(content);
  return file.uri;
}

export async function shareSnippet(snippet: Snippet, format: 'txt' | 'js' | 'json'): Promise<void> {
  const uri = await exportSnippetAsFile(snippet, format);
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device');
  }
  await Sharing.shareAsync(uri, {
    mimeType: format === 'json' ? 'application/json' : 'text/plain',
    dialogTitle: `Share ${snippet.title}`,
  });
}

export async function saveExportLocally(snippet: Snippet, format: 'txt' | 'js' | 'json'): Promise<string> {
  const dir = new Directory(Paths.document, 'DevSnippets', 'exports');
  if (!dir.exists) dir.create();

  const sanitizedTitle = snippet.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${sanitizedTitle}.${format}`;

  let content: string;
  if (format === 'json') {
    content = JSON.stringify(
      {
        title: snippet.title,
        language: snippet.language,
        tags: snippet.tags.split(',').map((t) => t.trim()).filter(Boolean),
        code: snippet.code,
        createdAt: snippet.createdAt,
      },
      null,
      2
    );
  } else {
    content = `// Title: ${snippet.title}\n// Language: ${snippet.language}\n// Tags: ${snippet.tags}\n// Created: ${snippet.createdAt}\n\n${snippet.code}\n`;
  }

  const file = new File(dir, fileName);
  file.write(content);
  return file.uri;
}
