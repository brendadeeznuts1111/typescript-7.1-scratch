/**
 * Runtime arm: import the physical fixture under motherload/register (spawn with --preload).
 */
import { pathToFileURL } from "node:url";

import { wireStringify } from "../lib/json-wire.ts";

const absPath = process.argv[2];
if (!absPath) {
  console.error("usage: runtime-import-child.ts <absolute-path>");
  process.exit(2);
}

const url = pathToFileURL(absPath).href;
const mod = await import(url);
process.stdout.write(wireStringify(mod.default));
