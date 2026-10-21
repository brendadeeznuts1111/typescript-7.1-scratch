import { describe, expect, test } from "bun:test";

import { snapshot } from "./lib/mapper.ts";
import { absoluteFixturePath } from "./lib/paths.ts";
import { externalCsvParseSnapshot } from "./lib/spawn-value.ts";
import { rules } from "./rules.ts";

const FIXTURE = "playground/fixtures/users.csv";
const PARSER = "csv-parse/sync";
const normalize = rules.csv.normalize;

function assertAllColumnsAreStrings(rows: unknown): asserts rows is Record<string, string>[] {
  expect(Array.isArray(rows)).toBe(true);
  for (const row of rows as Record<string, unknown>[]) {
    for (const [key, value] of Object.entries(row)) {
      expect(typeof value).toBe("string");
      expect(key.length).toBeGreaterThan(0);
    }
  }
}

describe("two-clock (csv, external parser)", () => {
  test(`motherload mapper ≟ ${PARSER} (${FIXTURE})`, async () => {
    const absPath = absoluteFixturePath(FIXTURE);

    const mapperRows = normalize(await snapshot(FIXTURE));
    const externalRows = normalize(await externalCsvParseSnapshot(absPath));

    assertAllColumnsAreStrings(mapperRows);
    assertAllColumnsAreStrings(externalRows);

    expect(mapperRows).toEqual(externalRows);
  });
});
