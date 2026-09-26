import * as fs from 'fs/promises';
import * as path from 'path';
import ignore, { Ignore } from 'ignore';

const IGNORE_FILE = '.noteignore';

const contentCache = new Map<string, string | null>();

async function readIgnoreFile(dir: string): Promise<string | null> {
  if (contentCache.has(dir)) return contentCache.get(dir) ?? null;

  let content: string | null = null;
  try {
    content = await fs.readFile(path.join(dir, IGNORE_FILE), 'utf-8');
  } catch {
    content = null;
  }

  contentCache.set(dir, content);
  return content;
}

export function clearIgnoreCache(): void {
  contentCache.clear();
}

/**
 * Rewrites a single .noteignore pattern so it can be matched against paths
 * relative to the vault root.
 *
 * gitignore semantics we need to preserve:
 *  - `foo/`  matches a *directory* named foo at any depth
 *  - `foo`   matches a file OR directory named foo at any depth
 *  - `/foo`  is anchored to the directory holding the .noteignore
 *  - `!foo`  re-includes a previously excluded path
 */
function rewritePattern(rawLine: string, relDir: string): string[] {
  const line = rawLine.trim();
  if (!line || line.startsWith('#')) return [];

  const negated = line.startsWith('!');
  const body = negated ? line.slice(1) : line;
  if (!body) return [];

  const anchored = body.startsWith('/') || body.slice(0, -1).includes('/');
  const bare = body.startsWith('/') ? body.slice(1) : body;
  if (!bare) return [];

  const prefix = relDir ? `${relDir}/` : '';
  const sign = negated ? '!' : '';

  // Unanchored patterns apply at any depth, so emit both the direct match and
  // a `**/` variant. The `ignore` package needs the trailing slash preserved
  // for directory-only patterns like `build/`.
  if (!anchored) {
    return [`${sign}${prefix}${bare}`, `${sign}${prefix}**/${bare}`];
  }

  return [`${sign}${prefix}${bare}`];
}

function isInside(root: string, target: string): boolean {
  return target === root || target.startsWith(root + path.sep);
}

/**
 * Builds a single matcher covering every .noteignore between the vault root and
 * the directory being listed, so parent rules are inherited by children.
 */
export async function buildIgnore(rootPath: string, targetDir: string): Promise<Ignore> {
  const root = path.resolve(rootPath);
  const target = path.resolve(targetDir);
  const ig = ignore();

  const chain: string[] = [];
  let current = target;

  while (true) {
    chain.unshift(current);
    if (current === root) break;
    const parent = path.dirname(current);
    if (parent === current || !isInside(root, parent)) break;
    current = parent;
  }

  for (const dir of chain) {
    if (!isInside(root, dir)) continue;
    const content = await readIgnoreFile(dir);
    if (!content) continue;

    const relDir = path.relative(root, dir);
    for (const line of content.split('\n')) {
      for (const pattern of rewritePattern(line, relDir)) {
        ig.add(pattern);
      }
    }
  }

  return ig;
}

/**
 * Directory entries must be tested with a trailing slash, otherwise
 * directory-only patterns such as `drafts/` silently never match.
 */
export function isIgnored(ig: Ignore, rootPath: string, absPath: string, isDir: boolean): boolean {
  const root = path.resolve(rootPath);
  const rel = path.relative(root, absPath);

  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return false;

  return ig.ignores(isDir ? `${rel}/` : rel);
}
