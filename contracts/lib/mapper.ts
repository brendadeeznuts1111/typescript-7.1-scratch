import { join } from "node:path";

import type { FixtureCase } from "../manifest.ts";
import type { ImportKind } from "../rules.ts";
import { cacheKey, getCached, setCached } from "./mapper-cache.ts";
import { wireParse } from "./json-wire.ts";
import { absoluteFixturePath, REPO_ROOT } from "./paths.ts";

const MAPPER_CHILD = join(REPO_ROOT, "contracts/bin/mapper-value-child.ts");

/** Fresh Bun child (no preload) — plugin.load codegen arm only. */
async function runMapperChild(absPath: string): Promise<unknown> {
  const proc = Bun.spawn({
    cmd: ["bun", MAPPER_CHILD, absPath],
    cwd: REPO_ROOT,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (exitCode !== 0) {
    throw new Error(stderr.trim() || stdout.trim() || `mapper child exit ${exitCode}`);
  }
  return wireParse(stdout);
}

/**
 * Mapper/codegen snapshot for a repo-relative fixture path.
 * Cached per `(absolutePath, importKind)`; subprocess keeps the test parent honest.
 */
export async function snapshot(
  repoRelativePath: string,
  importKind: ImportKind = "default",
): Promise<unknown> {
  const absPath = absoluteFixturePath(repoRelativePath);
  const c: FixtureCase = { id: repoRelativePath, path: repoRelativePath, importKind };
  const key = cacheKey(c, absPath);
  const hit = getCached(key);
  if (hit !== undefined) return hit;
  const value = await runMapperChild(absPath);
  setCached(key, value);
  return value;
}
