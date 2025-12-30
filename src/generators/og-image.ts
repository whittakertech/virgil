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

function getPath(obj: unknown, path: string): unknown {
  return path
      .split('.')
      .reduce((acc: any, key) => {
        if (acc == null || typeof acc !== 'object') return undefined;
        return acc[key];
      }, obj);
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

  const renderCtx = {
    brand: ctx.brand,
    product: ctx.product,
    page: ctx.output.page,
    output: ctx.output
  }
  // Omit falsy blocks
  const IF_BLOCK =
      /{{\s*if\s+([a-zA-Z0-9_.]+)\s*}}([\s\S]*?){{\s*endif\s*}}/g;
  html = html.replace(IF_BLOCK, (_, condition, body) => {
    const value = getPath(renderCtx, condition);
    return value !== undefined && value !== null ? body : '';
  });

  // Replace placeholders
  html = html
      .replace(/{{brand.name}}/g, ctx.brand.name)
      .replace(/{{brand.logo}}/g, ctx.brand.logo || '')
      .replace(/{{brand.color}}/g, ctx.brand.color)
      .replace(/{{product.name}}/g, ctx.product.name)
      .replace(/{{product.logo}}/g, ctx.product.logo || '')
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
