# config-server (M1)

Minimal **typed cross-domain runtime**: TOML config, `.env` overrides, CSV → `bun:sqlite`, Markdown frontmatter + `Bun.file` body, `Bun.serve`.

No Redis, WebSocket, or dynamic routes (M2+).

## Run

```bash
bun run typecheck:config-server
bun run example:config-server
curl -s http://127.0.0.1:3100/health
curl -s http://127.0.0.1:3100/users
curl -s http://127.0.0.1:3100/docs/hello
curl -s http://127.0.0.1:3100/docs/hello/frontmatter
curl -s http://127.0.0.1:3100/docs/hello/raw
```

`/docs/:slug/raw` streams `Bun.file` bytes as-on-disk (frontmatter included). App parity compares to `slugToFixture(slug).file.text()` — **rule: none (run-clock smoke)**, not `rules.md`.

Startup: `app.ts` prints `listening on http://127.0.0.1:<port>` to **stdout** (ephemeral `PORT=0` in app-parity tests). WebSocket: `ws://<host>/live` (derive from the same line).

`POST /users` inserts a row, **broadcasts** `{ type: "user.created", user }` to all `/live` clients, then returns `201`. Broadcast runs before the response so tests can `await wsOpened` → `fetch(POST)` → `broadcastWithTimeout`.

`PORT` and `DB_PATH` come from `process.env` after `loadEnvFile` on `playground/fixtures/sample.env`, then fall back to `config.toml`.

## Contracts

App-level parity (`mapper snapshot ≟ served JSON`) lives in [`contracts/app.parity.test.ts`](./contracts/app.parity.test.ts), run via `bun run test:contracts`.
