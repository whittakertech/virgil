export interface VirgilLock {
  version: '0.1';
  entries: Record<string, LockEntry>;
}

export interface LockEntry {
  hash: string;
  generatedAt: string;
  generator: string;
  generatorVersion: string;
}
