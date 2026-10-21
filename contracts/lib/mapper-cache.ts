import type { FixtureCase } from "../manifest.ts";

const cache = new Map<string, unknown>();

export function cacheKey(c: FixtureCase, absPath: string): string {
  return `${absPath}:${c.importKind}`;
}

export function getCached(key: string): unknown | undefined {
  return cache.get(key);
}

export function setCached(key: string, value: unknown): void {
  cache.set(key, value);
}

export function clearMapperCache(): void {
  cache.clear();
}
