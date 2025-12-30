import { createHash } from 'crypto';
import { readFile } from 'fs/promises';

export const GENERATOR_VERSION = '0.1.0';

export interface HashInput {
  data: unknown;
  templatePath?: string;
  generatorName: string;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return JSON.stringify(value.map(stableStringify));
  }

  const obj = value as Record<string, unknown>;
  const sortedKeys = Object.keys(obj).sort();

  const normalized: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    normalized[key] = obj[key];
  }

  return JSON.stringify(normalized);
}

/**
 * Compute deterministic hash from input data, template contents, and generator version.
 * 
 * This ensures:
 * - Data changes trigger regeneration
 * - Template changes trigger regeneration
 * - Generator version changes trigger regeneration
 */
export async function computeHash(input: HashInput): Promise<string> {
  const parts: string[] = [];

  // 1. Serialize data (stable JSON)
  parts.push(stableStringify(input.data));

  // 2. Include template contents if specified
  if (input.templatePath) {
    const templateContents = await readFile(input.templatePath, 'utf-8');
    parts.push(templateContents);
  }

  // 3. Include generator identity
  parts.push(input.generatorName);
  parts.push(GENERATOR_VERSION);

  // Compute SHA-256
  const hash = createHash('sha256');
  hash.update(parts.join('\n'));
  
  return `sha256:${hash.digest('hex')}`;
}

/**
 * Compute hash for a file's contents
 */
export async function hashFile(filepath: string): Promise<string> {
  const contents = await readFile(filepath);
  const hash = createHash('sha256');
  hash.update(contents);
  return `sha256:${hash.digest('hex')}`;
}
