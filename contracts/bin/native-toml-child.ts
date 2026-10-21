/**
 * Independent TOML arm: Bun.file I/O + smol-toml (no motherload/register).
 * Spawn as: bun contracts/bin/native-toml-child.ts <absolute-path>
 */
import { parse } from "smol-toml";

import { wireStringify } from "../lib/json-wire.ts";

const absPath = process.argv[2];
if (!absPath) {
  console.error("usage: native-toml-child.ts <absolute-path>");
  process.exit(2);
}

const text = await Bun.file(absPath).text();
const value = parse(text);

process.stdout.write(wireStringify(value));
