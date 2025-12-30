#!/usr/bin/env node

import { Command } from 'commander';
import { run } from './engine/run.js';
import { resolve } from 'path';

const program = new Command();

program
  .name('virgil')
  .description('Build-phase sigil forge for static site artifacts')
  .version('0.1.0');

program
  .command('build')
  .description('Generate artifacts from virgil.spec.json')
  .option('-r, --root <dir>', 'Project root directory', process.cwd())
  .option('-o, --output <dir>', 'Output directory', 'public')
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (options) => {
    const rootDir = resolve(options.root);
    const outputDir = resolve(rootDir, options.output);

    console.log('🔮 Virgil v0.1.0');
    console.log(`📁 Root: ${rootDir}`);
    console.log(`📦 Output: ${outputDir}`);
    console.log('');

    const result = await run({
      rootDir,
      outputDir,
      verbose: options.verbose
    });

    if (result.errors.length > 0) {
      console.error('\n❌ Errors:');
      for (const error of result.errors) {
        console.error(`  ${error}`);
      }
      process.exit(1);
    }

    console.log('\n✨ Done');
    process.exit(0);
  });

program.parse();
