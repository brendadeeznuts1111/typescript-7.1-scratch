/**
 * Independent CSV arm: Bun.file I/O + csv-parse (no motherload/register).
 * Spawn as: bun contracts/bin/native-csv-child.ts <absolute-path>
 */
import { parse } from "csv-parse/sync";

import { wireStringify } from "../lib/json-wire.ts";

const absPath = process.argv[2];
if (!absPath) {
  console.error("usage: native-csv-child.ts <absolute-path>");
  process.exit(2);
}

const text = await Bun.file(absPath).text();
const records = parse(text, {
  columns: true,
  bom: true,
  skip_empty_lines: true,
});

process.stdout.write(wireStringify(records));
