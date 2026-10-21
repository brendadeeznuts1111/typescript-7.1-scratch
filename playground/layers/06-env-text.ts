import notes from "../fixtures/notes.txt";
import { join } from "node:path";

import { type Equal, expect } from "../lib/assert.ts";

expect<Equal<typeof notes, string>>();

const envPath = join(import.meta.dir, "../fixtures/sample.env");

export function layerEnvText() {
  process.loadEnvFile(envPath);

  return {
    layer: "06-env-text",
    databaseUrl: process.env.DATABASE_URL,
    greeting: process.env.GREETING,
    notesFirstLine: notes.split("\n")[0],
    envLoadedFrom: envPath,
  };
}
