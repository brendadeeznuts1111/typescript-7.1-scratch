import { loadRuntimeConfig, startupConfigForLog } from "./config.ts";
import { openDatabase } from "./db.ts";
import { createLiveHub } from "./live.ts";
import { getRedisClient, initRedisAtStartup } from "./redis.ts";
import { createHandlers } from "./routes.ts";

const runtimeConfig = loadRuntimeConfig();
const { port, dbPath } = runtimeConfig;
console.log(Bun.inspect(startupConfigForLog(runtimeConfig), { sorted: true }));
await initRedisAtStartup();

const db = openDatabase(dbPath);
const live = createLiveHub();
const handlers = createHandlers(db, live, getRedisClient());

// Canonical Bun.serve({ fetch, websocket }) — upgrade in fetch via server.upgrade(req).
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: Number.isFinite(port) ? port : 3100,
  fetch(req, srv) {
    const url = new URL(req.url);

    if (url.pathname === "/live") {
      if (srv.upgrade(req)) return;
      return new Response("Upgrade required", { status: 426 });
    }

    if (url.pathname === "/health" && req.method === "GET") return handlers.health();
    if (url.pathname === "/users" && req.method === "GET") return handlers.users();
    if (url.pathname === "/users" && req.method === "POST") return handlers.postUser(req);

    const frontmatter = /^\/docs\/([^/]+)\/frontmatter$/.exec(url.pathname);
    if (frontmatter && req.method === "GET") return handlers.docsFrontmatter(frontmatter[1]!);

    const raw = /^\/docs\/([^/]+)\/raw$/.exec(url.pathname);
    if (raw && req.method === "GET") return handlers.docsRaw(raw[1]!);

    const doc = /^\/docs\/([^/]+)$/.exec(url.pathname);
    if (doc && req.method === "GET") return handlers.docsBody(doc[1]!);

    return new Response("Not Found", { status: 404 });
  },
  websocket: {
    open(ws) {
      live.add(ws);
    },
    message(_ws, _message) {
      // clients are receive-only for server broadcasts
    },
    close(ws) {
      live.remove(ws);
    },
  },
});

console.log(`listening on http://${server.hostname}:${server.port}`);
