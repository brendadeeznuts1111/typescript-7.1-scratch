/**
 * Layer 7: compile-time guardrails (@ts-expect-error).
 * If motherload or TS regresses, this file fails `tsc --runExternalCode`.
 */
import config from "../fixtures/config.toml";
import users from "../fixtures/users.csv";

// @ts-expect-error port is a number
const wrongPort: string = config.port;

// @ts-expect-error readonly tuple is not a mutable string array
const mutableTags: string[] = config.tags;

// @ts-expect-error key does not exist on inferred TOML shape
config.missing;

// @ts-expect-error CSV header has no phone column
users[0]?.phone;

export function layerTypeGuards() {
  return { layer: "07-type-guards", status: "compile-time negatives OK" };
}
