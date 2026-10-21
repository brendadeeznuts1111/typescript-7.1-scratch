/**
 * MD frontmatter arm (tier 2): Bun.file + --- split + Bun.YAML.parse.
 * Not Bun.markdown — that is a CommonMark renderer, not { md, frontmatter }.
 * Spawn as: bun contracts/bin/native-md-child.ts <absolute-path>
 */
import { wireStringify } from "../lib/json-wire.ts";

const absPath = process.argv[2];
if (!absPath) {
  console.error("usage: native-md-child.ts <absolute-path>");
  process.exit(2);
}

const text = await Bun.file(absPath).text();

const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
if (!match) {
  console.error("no frontmatter block");
  process.exit(2);
}

const [, yamlBlock, body] = match;
const frontmatter = Bun.YAML.parse(yamlBlock);
const md = body;

process.stdout.write(wireStringify({ frontmatter, md }));
