import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { join } from "node:path";

import { buildDashboardFromConfig, servedUsersPanelData } from "../dashboard.ts";
import { snapshot } from "../../../contracts/lib/mapper.ts";
import { REPO_ROOT } from "../../../contracts/lib/paths.ts";
import { rules } from "../../../contracts/rules.ts";

const APP = join(REPO_ROOT, "examples/config-server/app.ts");
const DASHBOARD_FIXTURE = "playground/fixtures/dashboard.toml";
const USERS_FIXTURE = "playground/fixtures/users.csv";
const POST_FIXTURE = "playground/fixtures/post.md";

/**
 * Per-panel served-view (composition receipt):
 * | Panel | Served view |
 * | users | canonicalServeOrder ∘ rules.csv.normalize (non-identity — app chose name order) |
 * | docs  | rules.md.normalize (identity — full typed { frontmatter, md }) |
 *
 * Claim: panels[i].data === servedView[panel.type](mapper(panel.source)).
 * Does not replace leaf two-clock arms; uses the same leaf shapes through dashboard.toml.
 */

type UserRow = { name: string; email: string; zip: string };

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

async function expectedPanelData(type: string, source: string): Promise<unknown> {
  if (type === "users" && source === "users.csv") {
    const rows = rules.csv.normalize(await snapshot(USERS_FIXTURE)) as UserRow[];
    return rules.csv.normalize(servedUsersPanelData(rows));
  }
  if (type === "docs" && source === "post.md") {
    return rules.md.normalize(await snapshot(POST_FIXTURE));
  }
  throw new Error(`unexpected panel ${type}/${source}`);
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

describe("two-clock (dashboard composition)", () => {
  test("GET /dashboard panels match servedView(type, mapper(source))", async () => {
    const res = await fetch(`${base}/dashboard`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      title: string;
      panels: { type: string; data: unknown }[];
    };

    const dashMapper = rules.toml.normalize(await snapshot(DASHBOARD_FIXTURE)) as {
      title: string;
      panels: { type: string; source: string }[];
    };

    expect(body.title).toBe(dashMapper.title);
    expect(body.panels.length).toBe(dashMapper.panels.length);

    for (let i = 0; i < dashMapper.panels.length; i++) {
      const spec = dashMapper.panels[i]!;
      expect(body.panels[i]?.type).toBe(spec.type);
      expect(body.panels[i]?.data).toEqual(await expectedPanelData(spec.type, spec.source));
    }
  });

  test("missing source fixture fails at startup resolution (deterministic error)", async () => {
    const bad = {
      title: "bad",
      panels: [{ type: "users", source: "nope.csv" }],
    };
    await expect(buildDashboardFromConfig(bad)).rejects.toThrow(
      /dashboard: missing source fixture playground\/fixtures\/nope\.csv/,
    );
  });
});
