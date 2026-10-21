import { afterAll, beforeAll, expect, test } from "bun:test";
import { join } from "node:path";

import { snapshot } from "../../../contracts/lib/mapper.ts";
import { REPO_ROOT } from "../../../contracts/lib/paths.ts";
import { rules } from "../../../contracts/rules.ts";

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
  server = Bun.spawn({
    cmd: ["bun", "--preload", "motherload/register", APP],
    cwd: REPO_ROOT,
    env: { ...process.env, PORT: "0", DB_PATH: ":memory:" },
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

test("GET /users matches mapper CSV arm", async () => {
  const res = await fetch(`${base}/users`);
  expect(res.status).toBe(200);
  const body = await res.json();
  const mapperRows = await snapshot("playground/fixtures/users.csv");
  expect(body).toEqual(rules.csv.normalize(mapperRows));
});

test("GET /docs/hello frontmatter matches mapper MD arm", async () => {
  const res = await fetch(`${base}/docs/hello`);
  expect(res.status).toBe(200);
  const { frontmatter } = (await res.json()) as { frontmatter: unknown };
  const mapperMd = await snapshot("playground/fixtures/post.md");
  const normalized = rules.md.normalize(mapperMd) as { frontmatter: unknown };
  expect(frontmatter).toEqual(normalized.frontmatter);
});
