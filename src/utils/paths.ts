import { resolve, join, relative } from 'path';

/**
 * Resolve paths relative to project root
 */
export class PathResolver {
  constructor(private rootDir: string) {}

  resolve(...segments: string[]): string {
    return resolve(this.rootDir, ...segments);
  }

  join(...segments: string[]): string {
    return join(this.rootDir, ...segments);
  }

  relative(from: string, to: string): string {
    return relative(from, to);
  }

  // Standard Virgil paths
  get spec(): string {
    return this.resolve('virgil.spec.json');
  }

  get lock(): string {
    return this.resolve('virgil.lock.json');
  }

  get manifest(): string {
    return this.resolve('virgil.manifest.json');
  }
}
