/**
 * Two halves of the same feature:
 *
 * 1. **Type time** — `contentMappers` in tsconfig; `tsc --runExternalCode` spawns mapper processes
 *    (JSON-RPC on stdio) that turn each foreign file into TS syntax + precise types.
 * 2. **Run time** — `bun --preload motherload/register` hooks Bun's loader so imports resolve to parsed data.
 *
 * Bun's native import attributes (`with { type: "toml" }`) are a separate, overlapping path documented at
 * https://bun.com/docs/runtime/file-types — motherload goes further with literal/`as const` inference.
 */
export const STACK = {
  typecheck: "tsc -p playground --noEmit --runExternalCode",
  runtime: "bun --preload motherload/register playground/main.ts",
  mapperPackage: "motherload",
  protocol: "TypeScript 7.1 content mapper (JSON-RPC / stdio)",
} as const;

export function layerStack() {
  return { layer: "00-stack", ...STACK };
}
