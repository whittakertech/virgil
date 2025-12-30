import { writeFile } from 'fs/promises';
import { RobotsOutput } from '../types/spec.js';
import { ensureParentDir } from '../utils/fs.js';

export interface RobotsContext {
  output: RobotsOutput;
}

/**
 * Generate robots.txt
 */
export async function generateRobots(
  ctx: RobotsContext,
  outputPath: string
): Promise<void> {
  const lines: string[] = [];

  for (const rule of ctx.output.rules) {
    lines.push(`User-agent: ${rule.userAgent}`);

    if (rule.allow) {
      for (const path of rule.allow) {
        lines.push(`Allow: ${path}`);
      }
    }

    if (rule.disallow) {
      for (const path of rule.disallow) {
        lines.push(`Disallow: ${path}`);
      }
    }

    lines.push(''); // Blank line between rules
  }

  if (ctx.output.sitemap) {
    lines.push(`Sitemap: ${ctx.output.sitemap}`);
  }

  const content = lines.join('\n');

  await ensureParentDir(outputPath);
  await writeFile(outputPath, content, 'utf-8');
}
