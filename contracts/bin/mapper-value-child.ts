/**
 * Isolated mapper/codegen arm: plugin.load() → evaluate generated module.
 * Not run in the test process (no preload) so parity vs runtime import is falsifiable.
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { plugin } from "../../node_modules/motherload/src/plugin.js";

import { wireStringify } from "../lib/json-wire.ts";

const absPath = process.argv[2];
if (!absPath) {
  console.error("usage: mapper-value-child.ts <absolute-path>");
  process.exit(2);
}

const source = readFileSync(absPath, "utf8");
const result = plugin.load(source, absPath);
if (result.problems.length) {
  console.error(result.problems.map((p) => p.message).join("; "));
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), "motherload-snap-"));
const file = join(dir, "snap.mjs");
writeFileSync(file, result.code, "utf8");

try {
  const mod = await import(pathToFileURL(file).href);
  process.stdout.write(wireStringify(mod.default));
} finally {
  rmSync(dir, { recursive: true, force: true });
}
