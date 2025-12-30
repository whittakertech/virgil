import { mkdir, access } from 'fs/promises';
import { dirname } from 'path';

/**
 * Ensure directory exists, create if needed
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await access(dirPath);
  } catch {
    await mkdir(dirPath, { recursive: true });
  }
}

/**
 * Ensure parent directory exists for a file path
 */
export async function ensureParentDir(filePath: string): Promise<void> {
  await ensureDir(dirname(filePath));
}

/**
 * Check if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
