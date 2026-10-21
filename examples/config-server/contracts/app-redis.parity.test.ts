import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { usersCacheKey } from "../redis.ts";
import { REPO_ROOT } from "../../../contracts/lib/paths.ts";

const APP = join(REPO_ROOT, "examples/config-server/app.ts");
const hasRedis = Boolean(process.env.REDIS_URL);

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

async function defaultRedis() {
  const { redis } = await import("bun");
  return redis;
}

describe("app-level (redis)", () => {
  beforeAll(async () => {
    if (!hasRedis) return;
    await (await defaultRedis()).ping();
    server = Bun.spawn({
      cmd: ["bun", "--preload", "motherload/register", APP],
      cwd: REPO_ROOT,
      env: {
        ...process.env,
        PORT: "0",
        DB_PATH: ":memory:",
        REDIS_URL: process.env.REDIS_URL!,
      },
      stdout: "pipe",
      stderr: "pipe",
    });
    if (!(server.stdout instanceof ReadableStream)) {
      throw new Error("expected stdout pipe from config-server child");
    }
    base = await readStartupUrl(server.stdout);
  });

  afterAll(() => {
    if (hasRedis) server.kill();
  });

  test.skipIf(!hasRedis)("GET /users populates cache key", async () => {
    const redis = await defaultRedis();
    const key = usersCacheKey();
    await redis.del(key);
    const res = await fetch(`${base}/users`);
    expect(res.status).toBe(200);
    expect(await redis.exists(key)).toBe(true);
  });

  test.skipIf(!hasRedis)("POST /users invalidates cache key", async () => {
    const redis = await defaultRedis();
    const key = usersCacheKey();
    await fetch(`${base}/users`);
    expect(await redis.exists(key)).toBe(true);

    const row = { name: "Redis Test", email: "redis-test@example.com", zip: "00000" };
    const res = await fetch(`${base}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    expect(res.status).toBe(201);
    expect(await redis.exists(key)).toBe(false);
  });
});
