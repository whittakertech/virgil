import { readFile } from 'fs/promises';
import { join } from 'path';
import { VirgilSpec, OutputConfig } from '../types/spec.js';
import { VirgilLock } from '../types/lock.js';
import { VirgilManifest } from '../types/manifest.js';
import { PathResolver } from '../utils/paths.js';
import { computeHash, GENERATOR_VERSION } from './hash.js';
import { loadLock, saveLock, needsRegeneration, updateLockEntry } from './lock.js';
import { loadManifest, saveManifest, updateManifestEntry } from './manifest.js';
import { generateOGImage, generateOGImageFilename } from '../generators/og-image.js';
import { generateSitemap } from '../generators/sitemap.js';
import { generateRobots } from '../generators/robots.js';

export interface RunOptions {
  rootDir: string;
  outputDir: string;
  verbose?: boolean;
}

export interface RunResult {
  generated: number;
  skipped: number;
  errors: string[];
}

/**
 * Main orchestration - this is the heart of Virgil
 */
export async function run(options: RunOptions): Promise<RunResult> {
  const paths = new PathResolver(options.rootDir);
  const result: RunResult = {
    generated: 0,
    skipped: 0,
    errors: []
  };

  try {
    // Step 1: Load spec
    const specContents = await readFile(paths.spec, 'utf-8');
    const spec: VirgilSpec = JSON.parse(specContents);

    if (options.verbose) {
      console.log(`📋 Loaded spec with ${spec.outputs.length} outputs`);
    }

    // Step 2: Load previous lock
    const lock = await loadLock(paths.lock);

    // Step 3: Load manifest
    const manifest = await loadManifest(paths.manifest);

    // Step 4-7: Process each output
    for (const output of spec.outputs) {
      try {
        await processOutput(spec, output, lock, manifest, options, result);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        result.errors.push(`${output.id}: ${message}`);
      }
    }

    // Step 8: Write updated lock
    await saveLock(paths.lock, lock);

    // Step 9: Write updated manifest
    await saveManifest(paths.manifest, manifest);

    if (options.verbose) {
      console.log(`✅ Generated: ${result.generated}, Skipped: ${result.skipped}, Errors: ${result.errors.length}`);
    }

    return result;

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    result.errors.push(`Fatal: ${message}`);
    return result;
  }
}

async function processOutput(
  spec: VirgilSpec,
  output: OutputConfig,
  lock: VirgilLock,
  manifest: VirgilManifest,
  options: RunOptions,
  result: RunResult
): Promise<void> {
  // Compute current hash
  const hash = await computeHash({
    data: output,
    generatorName: output.type
  });

  // Check if regeneration needed
  if (!needsRegeneration(lock, output.id, hash)) {
    if (options.verbose) {
      console.log(`⏭️  Skipping ${output.id} (unchanged)`);
    }
    result.skipped++;
    return;
  }

  if (options.verbose) {
    console.log(`🔨 Generating ${output.id}`);
  }

  // Generate based on type
  let outputPath: string;
  let manifestPath: string;

  switch (output.type) {
    case 'og-image': {
      const filename = generateOGImageFilename(output.id);
      outputPath = join(options.outputDir, 'og', filename);
      manifestPath = `/og/${filename}`;

      await generateOGImage(
        {
          brand: spec.brand,
          product: spec.product,
          output
        },
        outputPath
      );

      updateManifestEntry(manifest, 'og', output.id, manifestPath);
      break;
    }

    case 'sitemap': {
      outputPath = join(options.outputDir, 'sitemap.xml');
      manifestPath = '/sitemap.xml';

      await generateSitemap({ output }, outputPath);
      updateManifestEntry(manifest, 'sitemap', output.id, manifestPath);
      break;
    }

    case 'robots': {
      outputPath = join(options.outputDir, 'robots.txt');
      manifestPath = '/robots.txt';

      await generateRobots({ output }, outputPath);
      updateManifestEntry(manifest, 'robots', output.id, manifestPath);
      break;
    }

    default:
      throw new Error(`Unknown output type: ${(output as any).type}`);
  }

  // Update lock
  updateLockEntry(lock, output.id, hash, output.type, GENERATOR_VERSION);
  result.generated++;
}
