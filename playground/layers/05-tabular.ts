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
  return {
    layer: "05-tabular",
    adaZip: users[0]?.zip,
    graceName: users[1]?.name,
    topScore: scores[0]?.score,
    runnerUp: scores[1]?.player,
  };
}
