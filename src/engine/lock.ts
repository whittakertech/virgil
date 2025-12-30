import { readFile, writeFile } from 'fs/promises';
import { VirgilLock, LockEntry } from '../types/lock.js';

const LOCK_VERSION = '0.1' as const;

/**
 * Load lock file if it exists, return empty lock otherwise
 */
export async function loadLock(lockPath: string): Promise<VirgilLock> {
  try {
    const contents = await readFile(lockPath, 'utf-8');
    return JSON.parse(contents);
  } catch (err) {
    // Lock doesn't exist or is invalid - start fresh
    return {
      version: LOCK_VERSION,
      entries: {}
    };
  }
}

/**
 * Write lock file atomically
 */
export async function saveLock(lockPath: string, lock: VirgilLock): Promise<void> {
  const contents = JSON.stringify(lock, null, 2);
  
  // Write to temp file, then rename (atomic on POSIX)
  const tempPath = `${lockPath}.tmp`;
  await writeFile(tempPath, contents, 'utf-8');
  
  // Atomic rename
  const { rename } = await import('fs/promises');
  await rename(tempPath, lockPath);
}

/**
 * Check if output needs regeneration
 */
export function needsRegeneration(
  lock: VirgilLock,
  id: string,
  currentHash: string
): boolean {
  const entry = lock.entries[id];
  
  if (!entry) {
    // Never generated before
    return true;
  }
  
  // Compare hashes
  return entry.hash !== currentHash;
}

/**
 * Update lock entry
 */
export function updateLockEntry(
  lock: VirgilLock,
  id: string,
  hash: string,
  generator: string,
  generatorVersion: string
): void {
  lock.entries[id] = {
    hash,
    generatedAt: new Date().toISOString(),
    generator,
    generatorVersion
  };
}
