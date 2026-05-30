import { File, Directory, Paths } from 'expo-file-system';
import type { LocalFile } from '@/types';

const ROOT_DIR_NAME = 'DevSnippets';

function getAppRoot(): Directory {
  return new Directory(Paths.document, ROOT_DIR_NAME);
}

export function ensureAppRoot(): void {
  const root = getAppRoot();
  if (!root.exists) {
    root.create();
  }
}

export function listDirectory(relativePath: string = ''): LocalFile[] {
  const dir = relativePath
    ? new Directory(Paths.document, ROOT_DIR_NAME, relativePath)
    : getAppRoot();

  if (!dir.exists) return [];

  const contents = dir.list();
  return contents.map((item) => ({
    name: item instanceof Directory ? item.name : (item as File).name,
    uri: item instanceof Directory ? item.uri : (item as File).uri,
    isDirectory: item instanceof Directory,
    size: item instanceof Directory ? null : ((item as File).size ?? null),
  }));
}

export function createFolder(relativePath: string, name: string): void {
  const dir = relativePath
    ? new Directory(Paths.document, ROOT_DIR_NAME, relativePath, name)
    : new Directory(Paths.document, ROOT_DIR_NAME, name);
  dir.create();
}

export function saveFile(relativePath: string, fileName: string, content: string): string {
  const dir = relativePath
    ? new Directory(Paths.document, ROOT_DIR_NAME, relativePath)
    : getAppRoot();

  if (!dir.exists) dir.create();

  const file = new File(dir, fileName);
  file.write(content);
  return file.uri;
}

export function readFile(uri: string): string {
  const file = new File(uri);
  return file.textSync();
}

export function deleteFileOrDir(uri: string, isDirectory: boolean): void {
  if (isDirectory) {
    const dir = new Directory(uri);
    if (dir.exists) dir.delete();
  } else {
    const file = new File(uri);
    if (file.exists) file.delete();
  }
}

export function moveFile(sourceUri: string, destDirRelativePath: string): void {
  const destDir = destDirRelativePath
    ? new Directory(Paths.document, ROOT_DIR_NAME, destDirRelativePath)
    : getAppRoot();

  if (!destDir.exists) destDir.create();

  const file = new File(sourceUri);
  file.move(destDir);
}

export function copyFile(sourceUri: string, destDirRelativePath: string): void {
  const destDir = destDirRelativePath
    ? new Directory(Paths.document, ROOT_DIR_NAME, destDirRelativePath)
    : getAppRoot();

  if (!destDir.exists) destDir.create();

  const srcFile = new File(sourceUri);
  const destFile = new File(destDir, srcFile.name);
  srcFile.copy(destFile);
}

export function saveScreenshot(snippetId: number, imageUri: string): string {
  const screenshotsDir = new Directory(Paths.document, ROOT_DIR_NAME, 'screenshots');
  if (!screenshotsDir.exists) screenshotsDir.create();

  const fileName = `snippet_${snippetId}_${Date.now()}.jpg`;
  const src = new File(imageUri);
  const dest = new File(screenshotsDir, fileName);
  src.copy(dest);
  return dest.uri;
}

export function getSnippetScreenshots(snippetId: number): LocalFile[] {
  const screenshotsDir = new Directory(Paths.document, ROOT_DIR_NAME, 'screenshots');
  if (!screenshotsDir.exists) return [];

  const contents = screenshotsDir.list();
  return contents
    .filter((item) => {
      if (item instanceof Directory) return false;
      return (item as File).name.startsWith(`snippet_${snippetId}_`);
    })
    .map((item) => ({
      name: (item as File).name,
      uri: (item as File).uri,
      isDirectory: false,
      size: (item as File).size ?? null,
    }));
}

export async function downloadTemplate(url: string, fileName: string): Promise<string> {
  const templatesDir = new Directory(Paths.document, ROOT_DIR_NAME, 'templates');
  if (!templatesDir.exists) templatesDir.create();

  const output = await File.downloadFileAsync(url, templatesDir);
  return output.uri;
}
