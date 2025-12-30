import { chromium } from 'playwright';
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { OGImageOutput, BrandConfig, ProductConfig } from '../types/spec.js';
import { ensureParentDir } from '../utils/fs.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface OGImageContext {
  brand: BrandConfig;
  product: ProductConfig;
  output: OGImageOutput;
  templatePath?: string;
}

/**
 * Generate OG image using Playwright
 */
export async function generateOGImage(
  ctx: OGImageContext,
  outputPath: string
): Promise<void> {
  // Load template
  const templatePath = ctx.templatePath || join(__dirname, '../templates/og-default.html');
  let html = await readFile(templatePath, 'utf-8');

  // Replace placeholders
  html = html
    .replace(/{{brand.name}}/g, ctx.brand.name)
    .replace(/{{brand.color}}/g, ctx.brand.color)
    .replace(/{{product.name}}/g, ctx.product.name)
    .replace(/{{product.version}}/g, ctx.product.version)
    .replace(/{{page.title}}/g, ctx.output.page.title)
    .replace(/{{page.url}}/g, ctx.output.page.url)
    .replace(/{{page.description}}/g, ctx.output.page.description || '');

  // Launch headless browser
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 }
  });

  // Set content and wait for fonts/assets
  await page.setContent(html, { waitUntil: 'networkidle' });

  // Ensure output directory exists
  await ensureParentDir(outputPath);

  // Screenshot
  await page.screenshot({
    path: outputPath,
    type: 'png'
  });

  await browser.close();
}

/**
 * Generate filename for OG image with cache-busting timestamp
 */
export function generateOGImageFilename(id: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  return `${id}.${timestamp}.png`;
}
