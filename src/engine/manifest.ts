import { readFile, writeFile } from 'fs/promises';
import { VirgilManifest } from '../types/manifest.js';

const MANIFEST_VERSION = '0.1' as const;

/**
 * Load manifest if it exists, return empty manifest otherwise
 */
export async function loadManifest(manifestPath: string): Promise<VirgilManifest> {
  try {
    const contents = await readFile(manifestPath, 'utf-8');
    return JSON.parse(contents);
  } catch (err) {
    return {
      version: MANIFEST_VERSION,
      og: {},
      sitemap: {},
      robots: {}
    };
  }
}

/**
 * Write manifest atomically
 */
export async function saveManifest(
  manifestPath: string,
  manifest: VirgilManifest
): Promise<void> {
  const contents = JSON.stringify(manifest, null, 2);
  
  const tempPath = `${manifestPath}.tmp`;
  await writeFile(tempPath, contents, 'utf-8');
  
  const { rename } = await import('fs/promises');
  await rename(tempPath, manifestPath);
}

/**
 * Update manifest entry for given output type
 */
export function updateManifestEntry(
  manifest: VirgilManifest,
  type: 'og' | 'sitemap' | 'robots',
  id: string,
  path: string
): void {
  if (!manifest[type]) {
    manifest[type] = {};
  }
  manifest[type]![id] = path;
}
