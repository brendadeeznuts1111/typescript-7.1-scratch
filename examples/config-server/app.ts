import { loadRuntimeConfig } from "./config.ts";
import { openDatabase } from "./db.ts";
import { createHandlers } from "./routes.ts";

const { port, dbPath } = loadRuntimeConfig();
const db = openDatabase(dbPath);
const handlers = createHandlers(db);

const server = Bun.serve({
  hostname: "127.0.0.1",
  port: Number.isFinite(port) ? port : 3100,
  routes: {
    "/health": handlers.health,
    "/users": handlers.users,
    "/docs/:slug": (req) => handlers.docs(req.params.slug),
  },
});

console.log(`listening on http://${server.hostname}:${server.port}`);
