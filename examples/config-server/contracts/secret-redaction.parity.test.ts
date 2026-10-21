import { describe, expect, test } from "bun:test";
import { join } from "node:path";

import { Redacted } from "../redacted.ts";
import { REPO_ROOT } from "../../../contracts/lib/paths.ts";

const APP = join(REPO_ROOT, "examples/config-server/app.ts");
const CANARY = "sk-test-do-not-log-9f3a";

async function readStartupStdout(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    if (/listening on http:\/\//.test(buf)) break;
  }
  return buf;
}

describe("secret redaction (startup stdout)", () => {
  test("Redacted inspects to literal tag", () => {
    expect(Bun.inspect(new Redacted(CANARY))).toBe("<redacted>");
  });

  test("spawned server logs PORT/DB_PATH but not SECRET_TOKEN canary", async () => {
    const { REDIS_URL: _omitRedis, ...envWithoutRedis } = process.env;
    const server = Bun.spawn({
      cmd: ["bun", "--preload", "motherload/register", APP],
      cwd: REPO_ROOT,
      env: { ...envWithoutRedis, PORT: "0", DB_PATH: ":memory:" },
      stdout: "pipe",
      stderr: "pipe",
    });
    if (!(server.stdout instanceof ReadableStream)) {
      throw new Error("expected stdout pipe");
    }

    const stdout = await readStartupStdout(server.stdout);
    server.kill();

    expect(stdout).toContain(":memory:");
    expect(stdout).toMatch(/port:\s*0/);
    expect(stdout).not.toContain(CANARY);
    expect(stdout).toContain("<redacted>");
  });
});
