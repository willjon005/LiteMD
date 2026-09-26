import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { DirEntry, DirListing, FileNode } from '../../shared/types';
import { buildIgnore, isIgnored } from './ignoreParser';

const TEXT_EXTENSIONS = new Set(['.md', '.markdown', '.txt', '.json', '.csv']);

function mimeTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.md' || ext === '.markdown') return 'text/markdown';
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.svg') return 'image/svg+xml';
  return 'text/plain';
}

function expandHome(dirPath: string): string {
  if (dirPath === '~') return os.homedir();
  if (dirPath.startsWith('~/')) return path.join(os.homedir(), dirPath.slice(2));
  return dirPath;
}

/**
 * Lists a single directory. Children are intentionally NOT walked recursively:
 * the sidebar loads them on demand, so opening a large folder stays instant.
 */
export async function listDirectory(dirPath: string, rootPath?: string): Promise<DirListing> {
  const resolved = path.resolve(expandHome(dirPath));
  const root = path.resolve(expandHome(rootPath ?? dirPath));
  const parent = path.dirname(resolved);
  const entries: DirEntry[] = [];

  try {
    const stats = await fs.stat(resolved);
    if (!stats.isDirectory()) {
      return { path: resolved, parent, entries: [], error: 'Not a directory' };
    }

    const ig = await buildIgnore(root, resolved);
    const dirents = await fs.readdir(resolved, { withFileTypes: true });

    for (const dirent of dirents) {
      if (dirent.name.startsWith('.')) continue;
      if (dirent.isSymbolicLink()) continue;

      const fullPath = path.join(resolved, dirent.name);
      const isDir = dirent.isDirectory();

      if (isIgnored(ig, root, fullPath, isDir)) continue;

      entries.push({ name: dirent.name, path: fullPath, type: isDir ? 'folder' : 'file' });
    }

    entries.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return { path: resolved, parent, entries };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { path: resolved, parent, entries: [], error: message };
  }
}

export async function readRootFolder(rootPath: string): Promise<FileNode> {
  const listing = await listDirectory(rootPath, rootPath);
  const resolved = listing.path;

  return {
    name: path.basename(resolved) || resolved,
    path: resolved,
    type: 'folder',
    children: listing.entries.map(toFileNode)
  };
}

export function toFileNode(entry: DirEntry): FileNode {
  return { name: entry.name, path: entry.path, type: entry.type };
}

export async function readFile(filePath: string): Promise<{ content: string; mimeType: string }> {
  const mimeType = mimeTypeFor(filePath);
  const ext = path.extname(filePath).toLowerCase();

  // Binary formats are handed to their viewer as a path, never decoded as text.
  if (!TEXT_EXTENSIONS.has(ext)) {
    return { content: '', mimeType };
  }

  const content = await fs.readFile(filePath, 'utf-8');
  return { content, mimeType };
}

export async function saveFile(filePath: string, content: string): Promise<{ success: boolean; error?: string }> {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
