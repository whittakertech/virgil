export interface VirgilSpec {
  brand: BrandConfig;
  product: ProductConfig;
  outputs: OutputConfig[];
}

export interface BrandConfig {
  name: string;
  logo: string;
  color: string;
}

export interface ProductConfig {
  name: string;
  logo: string;
  version: string;
}

export type OutputConfig = OGImageOutput | SitemapOutput | RobotsOutput;

export interface OGImageOutput {
  type: 'og-image';
  id: string;
  page: {
    title: string;
    url: string;
    description?: string;
  };
}

export interface SitemapOutput {
  type: 'sitemap';
  id: string;
  baseUrl: string;
  pages: Array<{
    path: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
  }>;
}

export interface RobotsOutput {
  type: 'robots';
  id: string;
  rules: Array<{
    userAgent: string;
    allow?: string[];
    disallow?: string[];
  }>;
  sitemap?: string;
}
