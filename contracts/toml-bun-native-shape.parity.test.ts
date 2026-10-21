import { describe, expect, test } from "bun:test";

import { snapshot } from "./lib/mapper.ts";
import { absoluteFixturePath } from "./lib/paths.ts";
import { rules } from "./rules.ts";

/** Shape divergence arm — not a two-clock parity test. */
export const TOML_BUN_NATIVE_SHAPE_RECEIPT =
  "shape divergence — Bun returns Temporal, motherload returns string";

const FIXTURE = "playground/fixtures/config-edge.toml";
const MAPPER_ISO_STARTED = "1979-05-27T07:32:00.000Z";
const BUN_TOJSON_STARTED = "1979-05-27T07:32:00Z";

describe("toml shape divergence (Bun.TOML.parse)", () => {
  test(`documents Bun native wire shape (${FIXTURE})`, async () => {
    expect(TOML_BUN_NATIVE_SHAPE_RECEIPT).toContain("Temporal");

    const absPath = absoluteFixturePath(FIXTURE);
    const text = await Bun.file(absPath).text();
    const bunValue = Bun.TOML.parse(text);

    expect(bunValue.threshold).toBe(1000);
    expect(typeof bunValue.threshold).toBe("number");

    expect(bunValue.meta).toEqual({ host: "localhost", port: 8080 });

    const started = bunValue.started;
    expect(started).toBeInstanceOf(Temporal.Instant);
    expect(started.toJSON()).toBe(BUN_TOJSON_STARTED);
    expect(started.toJSON()).not.toBe(MAPPER_ISO_STARTED);

    expect(bunValue.day).toBeInstanceOf(Temporal.PlainDate);
    expect(bunValue.day.toJSON()).toBe("1979-05-27");

    const mapperStarted = rules.toml.normalize(await snapshot(FIXTURE)).started;
    expect(mapperStarted).toBe(MAPPER_ISO_STARTED);
    expect(mapperStarted).not.toBe(started.toJSON());
  });
});
