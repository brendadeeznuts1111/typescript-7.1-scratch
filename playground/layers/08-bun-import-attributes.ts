/**
 * Layer 8: Bun's built-in loaders vs motherload (types only here for plain JSON).
 *
 * At runtime Bun can load many formats natively; motherload adds `as const`-grade types via content mappers.
 * This layer uses Bun import attributes where motherload does not own the extension.
 */
import plainAgain from "../fixtures/plain.json" with { type: "json" };
import notesAsText from "../fixtures/notes.txt" with { type: "text" };

import { type Equal, expect } from "../lib/assert.ts";

expect<Equal<typeof plainAgain, { port: number }>>();
expect<Equal<typeof notesAsText, string>>();

export function layerBunImportAttributes() {
  return {
    layer: "08-bun-import-attributes",
    plainPort: plainAgain.port,
    notesViaTextLoader: notesAsText.split("\n")[0],
    note: "TS 7.1 @types/bun types `with { type }` on imports; motherload types .txt/.md/etc without attributes",
  };
}
