import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { join } from "node:path";

import { wireParse } from "../../../contracts/lib/json-wire.ts";
import { snapshot } from "../../../contracts/lib/mapper.ts";
import { REPO_ROOT } from "../../../contracts/lib/paths.ts";
import { rules } from "../../../contracts/rules.ts";

const FIXTURE = "playground/fixtures/users.csv";
const APP = join(REPO_ROOT, "examples/config-server/app.ts");
const normalize = rules.csv.normalize;

// This test catches handler-side reshaping: type coercion (zip: "02134" → 2134),
// column drop (delete row.email), and — because the fixture is sorted so that
// rowid order ≠ name order — any handler that changes its ORDER BY clause
// without updating the SQLite arm. Both arms declare ORDER BY name ASC, rowid ASC;
// if that clause drifts on either side, this test fails.

let server: ReturnType<typeof Bun.spawn>;
let base: string;

async function readStartupUrl(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const match = /listening on (http:\/\/[^\s]+)/.exec(buf);
    if (match?.[1]) return match[1];
  }
  throw new Error(`server did not print listening URL; got: ${buf}`);
}

/** M1 seed in isolated :memory: DB (preload child). */
async function freshSqliteRows(): Promise<unknown> {
  const proc = Bun.spawn({
    cmd: [
      "bun",
      "--preload",
      "motherload/register",
      "-e",
      `import { openDatabase, LIST_USERS_SQL } from "./examples/config-server/db.ts";
const db = openDatabase(":memory:");
const rows = db.query(LIST_USERS_SQL).all();
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

type UserRow = { name: string; email: string; zip: string };

/**
 * Literal sort-by-name (email tiebreak) — NOT derived from LIST_USERS_SQL.
 * If LIST_USERS_SQL's ORDER BY changes, update this deliberately so A ≟ B fails
 * until both encode the same served order.
 */
function canonicalServeOrder(rows: UserRow[]): UserRow[] {
  return [...rows].sort(
    (a, b) => a.name.localeCompare(b.name) || a.email.localeCompare(b.email),
  );
}

/** GET /users returns a bare array of rows (not { users } / { data, meta }). */
function usersFromHttpBody(body: unknown): unknown {
  if (!Array.isArray(body)) {
    throw new Error(`expected GET /users array body, got ${typeof body}`);
  }
  return body;
}

beforeAll(async () => {
  const { REDIS_URL: _omitRedis, ...envWithoutRedis } = process.env;
  server = Bun.spawn({
    cmd: ["bun", "--preload", "motherload/register", APP],
    cwd: REPO_ROOT,
    env: { ...envWithoutRedis, PORT: "0", DB_PATH: ":memory:" },
    stdout: "pipe",
    stderr: "pipe",
  });
  if (!(server.stdout instanceof ReadableStream)) {
    throw new Error("expected stdout pipe from config-server child");
  }
  base = await readStartupUrl(server.stdout);
});

afterAll(() => {
  server.kill();
});

describe("full-chain (csv: mapper ≟ sqlite ≟ http /users)", () => {
  test("three pairwise: storage fidelity, handler fidelity, full-chain claim", async () => {
    const mapperRows = (await snapshot(FIXTURE)) as UserRow[];
    const A = normalize(canonicalServeOrder(mapperRows));
    const B = normalize(await freshSqliteRows());

    const res = await fetch(`${base}/users`);
    expect(res.status).toBe(200);
    const C = normalize(usersFromHttpBody(await res.json()));

    expect(A).toEqual(B);
    expect(B).toEqual(C);
    expect(A).toEqual(C);
  });
});
