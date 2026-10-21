import data from "../fixtures/data.json5";
import settings from "../fixtures/settings.jsonc";
import plain from "../fixtures/plain.json" with { type: "json" };

import { type Equal, expect } from "../lib/assert.ts";

expect<
  Equal<
    typeof settings,
    { readonly "editor.fontSize": 14; readonly "files.exclude": readonly ["dist", "node_modules"] }
  >
>();

expect<
  Equal<
    typeof data,
    { readonly unquoted: "single quotes"; readonly hex: 16; readonly infinite: number; readonly list: readonly [1, 2, 3] }
  >
>();

// Plain `.json` stays on TypeScript's JSON module path (widened), not motherload's `as const` inference.
expect<Equal<typeof plain, { port: number }>>();

export function layerJsonFamily() {
  return {
    layer: "04-json-family",
    fontSize: settings["editor.fontSize"],
    hex: data.hex,
    infinite: Number.isFinite(data.infinite) ? "finite" : "non-finite",
    plainPort: plain.port,
  };
}
