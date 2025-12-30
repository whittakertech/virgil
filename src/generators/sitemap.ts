import { writeFile } from 'fs/promises';
import { SitemapOutput } from '../types/spec.js';
import { ensureParentDir } from '../utils/fs.js';

export interface SitemapContext {
  output: SitemapOutput;
}

/**
 * Generate sitemap.xml
 */
export async function generateSitemap(
  ctx: SitemapContext,
  outputPath: string
): Promise<void> {
  const { baseUrl, pages } = ctx.output;

  const urls = pages.map(page => {
    const loc = `${baseUrl}${page.path}`;
    const lastmod = page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : '';
    const changefreq = page.changefreq ? `<changefreq>${page.changefreq}</changefreq>` : '';
    const priority = page.priority !== undefined ? `<priority>${page.priority}</priority>` : '';

    return `  <url>
    <loc>${loc}</loc>${lastmod}${changefreq}${priority}
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  await ensureParentDir(outputPath);
  await writeFile(outputPath, xml, 'utf-8');
}
