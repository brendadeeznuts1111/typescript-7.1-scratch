import { describe, expect, test } from "bun:test";

import { snapshot } from "./lib/mapper.ts";
import { absoluteFixturePath } from "./lib/paths.ts";
import { externalTomlParseSnapshot } from "./lib/spawn-value.ts";
import { rules } from "./rules.ts";

/** Edge fixture: smol-toml can parse; playground/fixtures/config.toml cannot (bigint, mixed arrays). */
const FIXTURE = "playground/fixtures/config-edge.toml";
const PARSER = "smol-toml";
const normalize = rules.toml.normalize;

describe("two-clock (toml, smol-toml)", () => {
  test(`motherload mapper ≟ ${PARSER} (${FIXTURE})`, async () => {
    const absPath = absoluteFixturePath(FIXTURE);

    const mapperValue = normalize(await snapshot(FIXTURE));
    const externalValue = normalize(await externalTomlParseSnapshot(absPath));

    expect(mapperValue).toEqual(externalValue);
  });
});
