import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { join } from "node:path";

import { slugToFixture } from "../docs.ts";
import { snapshot } from "../../../contracts/lib/mapper.ts";
import { REPO_ROOT } from "../../../contracts/lib/paths.ts";
import { rules } from "../../../contracts/rules.ts";
import {
  broadcastWithTimeout,
  httpBaseToLiveWs,
  wsOpened,
} from "./ws-test-helpers.ts";

const APP = join(REPO_ROOT, "examples/config-server/app.ts");

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

describe("app parity (mapper ≟ served)", () => {
  test("GET /users matches mapper CSV arm", async () => {
    const res = await fetch(`${base}/users`);
    expect(res.status).toBe(200);
    const body = await res.json();
    const mapperRows = await snapshot("playground/fixtures/users.csv");
    expect(body).toEqual(rules.csv.normalize(mapperRows));
  });

  test("GET /docs/hello/frontmatter matches mapper MD arm", async () => {
    const res = await fetch(`${base}/docs/hello/frontmatter`);
    expect(res.status).toBe(200);
    const { frontmatter } = (await res.json()) as { frontmatter: unknown };
    const mapperMd = await snapshot("playground/fixtures/post.md");
    const normalized = rules.md.normalize(mapperMd) as { frontmatter: unknown };
    expect(frontmatter).toEqual(normalized.frontmatter);
  });

  test("GET /docs/hello body text-equals mapper md string", async () => {
    const res = await fetch(`${base}/docs/hello`);
    expect(res.status).toBe(200);
    const body = await res.text();
    const mapperMd = await snapshot("playground/fixtures/post.md");
    const normalized = rules.md.normalize(mapperMd) as { md: string };
    expect(body).toBe(normalized.md);
  });
});

describe("live", () => {
  test("POST /users broadcasts user.created on /live", async () => {
    const ws = new WebSocket(httpBaseToLiveWs(base));
    await wsOpened(ws);

    const pendingBroadcast = broadcastWithTimeout(ws, 500);
    const row = { name: "Test User", email: "test@example.com", zip: "99999" };
    const res = await fetch(`${base}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(row);

    const msg = await pendingBroadcast;
    expect(msg).toEqual({ type: "user.created", user: row });
    ws.close();
  });
});

describe("smoke", () => {
  test("GET /docs/hello/raw text-equal to on-disk fixture (UTF-8) — rule: none (run-clock smoke)", async () => {
    const fx = slugToFixture("hello");
    if (!fx) throw new Error("slugToFixture(hello) missing");
    const onDisk = await fx.file.text();
    const res = await fetch(`${base}/docs/hello/raw`);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    const body = await res.text();
    expect(body).toBe(onDisk);
  });
});
