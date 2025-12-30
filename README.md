# Virgil

**Build-phase sigil forge for static site artifacts**

Virgil generates OG images, sitemaps, robots.txt, and other build artifacts deterministically with content-addressed caching.

## Philosophy

- **Deterministic**: Content-addressed hashing eliminates timestamp lies
- **Locked**: Only regenerates what actually changed
- **CI-first**: Designed for GitHub Actions, not local dev servers
- **Declarative**: Everything in `virgil.spec.json`

## Installation

```bash
npm install @whittakertech/virgil
```

## Quick Start

### 1. Create `virgil.spec.json`

```json
{
  "brand": {
    "name": "WhittakerTech",
    "logo": "docs/public/logo.svg",
    "color": "#5b7cff"
  },
  "product": {
    "name": "MosaicJS",
    "logo": "docs/public/mosaic-logo.svg",
    "version": "0.3.0"
  },
  "outputs": [
    {
      "type": "og-image",
      "id": "getting-started",
      "page": {
        "title": "Getting Started",
        "url": "https://mosaicjs.whittakertech.com/getting-started",
        "description": "Learn how to use MosaicJS"
      }
    }
  ]
}
```

### 2. Run Virgil

```bash
npx virgil build
```

### 3. Reference in frontmatter

```yaml
---
og-image: og:getting-started
---
```

Your static site generator resolves `og:getting-started` via `virgil.manifest.json`.

## How It Works

### Execution Flow

1. **Load spec** (`virgil.spec.json`) - declarative intent
2. **Load lock** (`virgil.lock.json`) - truth from last run
3. **Hash inputs** - SHA-256 of data + template + generator version
4. **Compare** - skip if hash matches
5. **Generate** - create artifacts only when needed
6. **Update manifest** (`virgil.manifest.json`) - stable references
7. **Write lock** - record current state

### Content-Addressed Hashing

```typescript
hash = sha256(
  JSON.stringify(data) +
  templateContents +
  generatorVersion
)
```

Changes to **data**, **template**, or **generator** trigger regeneration. Timestamp changes do not.

### Lock File (`virgil.lock.json`)

```json
{
  "version": "0.1",
  "entries": {
    "getting-started": {
      "hash": "sha256:9fa4c...",
      "generatedAt": "2025-01-15T10:30:00Z",
      "generator": "og-image",
      "generatorVersion": "0.1.0"
    }
  }
}
```

### Manifest (`virgil.manifest.json`)

```json
{
  "version": "0.1",
  "og": {
    "getting-started": "/og/getting-started.1735346221.png"
  }
}
```

Frontmatter uses stable IDs (`og:getting-started`), manifest maps to cache-busted filenames.

## Output Types

### OG Images

```json
{
  "type": "og-image",
  "id": "home",
  "page": {
    "title": "Welcome",
    "url": "https://example.com",
    "description": "Optional description"
  }
}
```

Generates 1200×630 PNG using Playwright.

### Sitemap

```json
{
  "type": "sitemap",
  "id": "main",
  "baseUrl": "https://example.com",
  "pages": [
    {
      "path": "/",
      "lastmod": "2025-01-15",
      "changefreq": "weekly",
      "priority": 1.0
    }
  ]
}
```

### Robots.txt

```json
{
  "type": "robots",
  "id": "default",
  "rules": [
    {
      "userAgent": "*",
      "allow": ["/"],
      "disallow": ["/admin"]
    }
  ],
  "sitemap": "https://example.com/sitemap.xml"
}
```

## CLI

```bash
virgil build [options]

Options:
  -r, --root <dir>     Project root directory (default: cwd)
  -o, --output <dir>   Output directory (default: public)
  -v, --verbose        Verbose output
```

## Programmatic Usage

```typescript
import { run } from '@whittakertech/virgil';

const result = await run({
  rootDir: process.cwd(),
  outputDir: 'public',
  verbose: true
});

console.log(`Generated: ${result.generated}`);
console.log(`Skipped: ${result.skipped}`);
```

## GitHub Actions

```yaml
- name: Generate artifacts
  run: npx virgil build --verbose
```

Virgil skips unchanged artifacts, keeping CI fast.

## v0.1 Scope

**Supported:**
- ✅ OG image generation (PNG)
- ✅ sitemap.xml generation
- ✅ robots.txt generation
- ✅ Content-addressed locking
- ✅ Manifest rewriting
- ✅ No-op if nothing changed

**Not Yet:**
- ❌ Watch mode
- ❌ Vite/VitePress runtime integration
- ❌ React/Vue rendering
- ❌ Remote data fetching
- ❌ Partial page crawling

## License

MIT

## Author

Lee Whittaker • WhittakerTech
