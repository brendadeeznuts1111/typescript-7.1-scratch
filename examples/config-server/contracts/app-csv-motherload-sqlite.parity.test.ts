import { describe, expect, test } from "bun:test";

import { wireParse } from "../../../contracts/lib/json-wire.ts";
import { snapshot } from "../../../contracts/lib/mapper.ts";
import { absoluteFixturePath, REPO_ROOT } from "../../../contracts/lib/paths.ts";
import { runtimeImportSnapshot } from "../../../contracts/lib/spawn-value.ts";
import { rules } from "../../../contracts/rules.ts";

const FIXTURE = "playground/fixtures/users.csv";
const FIXTURE_CASE = { id: FIXTURE, path: FIXTURE, importKind: "default" as const };
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

/** M1 seed via db.ts — must run under motherload/register (same as app child). */
async function sqliteRowsFromM1Seed(): Promise<unknown> {
  const proc = Bun.spawn({
    cmd: [
      "bun",
      "--preload",
      "motherload/register",
      "-e",
      `import { openDatabase } from "./examples/config-server/db.ts";
const db = openDatabase(":memory:");
const rows = db.query("SELECT name, email, zip FROM users ORDER BY rowid").all();
console.log(JSON.stringify(rows));
db.close();`,
    ],
    cwd: REPO_ROOT,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (exitCode !== 0) {
    throw new Error(stderr.trim() || stdout.trim() || `M1 seed child exit ${exitCode}`);
  }
  return wireParse(stdout);
}

describe("app parity (csv motherload ≟ sqlite)", () => {
  test("motherload runtime import ≟ SQLite seed (ORDER BY rowid)", async () => {
    const absPath = absoluteFixturePath(FIXTURE);

    const mapperRows = normalize(await snapshot(FIXTURE));
    const motherloadRows = normalize(await runtimeImportSnapshot(FIXTURE_CASE, absPath));

    // rowid relies on M1 insert order; keep db.ts seed order = CSV row order.
    const sqliteRows = normalize(await sqliteRowsFromM1Seed());

    assertAllColumnsAreStrings(mapperRows);
    assertAllColumnsAreStrings(motherloadRows);
    assertAllColumnsAreStrings(sqliteRows);

    expect(mapperRows).toEqual(motherloadRows);
    expect(motherloadRows).toEqual(sqliteRows);
  });

  test("SQLite arm exposes TEXT-shaped cells (policy: no numeric coercion)", async () => {
    const sqliteRows = await sqliteRowsFromM1Seed();
    assertAllColumnsAreStrings(sqliteRows);
  });
});
