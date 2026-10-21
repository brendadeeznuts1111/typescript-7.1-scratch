/**
 * Layered TS 7.1 + motherload playground.
 *
 *   bun run typecheck:playground
 *   bun run playground
 */
import { runAllLayers } from "./layers/index.ts";

const results = runAllLayers();

console.log(JSON.stringify({ layers: results.length, results }, null, 2));
