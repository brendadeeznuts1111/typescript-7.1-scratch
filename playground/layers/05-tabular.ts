import scores from "../fixtures/scores.tsv";
import users from "../fixtures/users.csv";

import { type Equal, expect } from "../lib/assert.ts";

expect<
  Equal<
    typeof users,
    readonly { readonly name: string; readonly email: string; readonly zip: string }[]
  >
>();

expect<Equal<typeof scores, readonly { readonly player: string; readonly score: string }[]>>();

export function layerTabular() {
  const ada = users.find((u) => u.name === "Ada Lovelace");
  const grace = users.find((u) => u.name === "Hopper, Grace");
  return {
    layer: "05-tabular",
    adaZip: ada?.zip,
    graceName: grace?.name,
    topScore: scores[0]?.score,
    runnerUp: scores[1]?.player,
  };
}
