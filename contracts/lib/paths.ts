import { join } from "node:path";

/** Repo root: contracts/lib → contracts → repo */
export const REPO_ROOT = join(import.meta.dir, "../..");

export function absoluteFixturePath(repoRelative: string): string {
  return join(REPO_ROOT, repoRelative);
}
