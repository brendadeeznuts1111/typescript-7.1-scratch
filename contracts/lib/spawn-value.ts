import { join } from "node:path";

import type { FixtureCase } from "../manifest.ts";
import { snapshot } from "./mapper.ts";
import { wireParse } from "./json-wire.ts";
import { REPO_ROOT } from "./paths.ts";

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

/** Codegen/mapper arm via {@link snapshot}. */
export async function mapperCodegenSnapshot(c: FixtureCase, _absPath: string): Promise<unknown> {
  return snapshot(c.path, c.importKind);
}

/** Runtime arm via motherload/register in a fresh Bun child. */
export async function runtimeImportSnapshot(_c: FixtureCase, absPath: string): Promise<unknown> {
  return runChild(["bun", "--preload", "motherload/register", RUNTIME_CHILD], absPath);
}
