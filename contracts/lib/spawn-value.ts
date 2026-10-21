import { join } from "node:path";

import type { FixtureCase } from "../manifest.ts";
import { wireParse } from "./json-wire.ts";
import { REPO_ROOT } from "./paths.ts";
import { cacheKey, getCached, setCached } from "./mapper-cache.ts";

const MAPPER_CHILD = join(REPO_ROOT, "contracts/bin/mapper-value-child.ts");
const RUNTIME_CHILD = join(REPO_ROOT, "contracts/bin/runtime-import-child.ts");

async function runChild(cmd: string[], absPath: string): Promise<unknown> {
  const proc = Bun.spawn({
    cmd: [...cmd, absPath],
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
    throw new Error(stderr.trim() || stdout.trim() || `child exit ${exitCode}`);
  }
  return wireParse(stdout);
}

/** Codegen/mapper arm via plugin.load in a fresh Bun child (no preload). */
export async function mapperCodegenSnapshot(c: FixtureCase, absPath: string): Promise<unknown> {
  const key = cacheKey(c, absPath);
  const hit = getCached(key);
  if (hit !== undefined) return hit;
  const value = await runChild(["bun", MAPPER_CHILD], absPath);
  setCached(key, value);
  return value;
}

/** Runtime arm via motherload/register in a fresh Bun child. */
export async function runtimeImportSnapshot(_c: FixtureCase, absPath: string): Promise<unknown> {
  return runChild(["bun", "--preload", "motherload/register", RUNTIME_CHILD], absPath);
}
