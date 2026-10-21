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
```

`PORT` and `DB_PATH` come from `process.env` after `loadEnvFile` on `playground/fixtures/sample.env`, then fall back to `config.toml`.

## Contracts

App-level parity (`mapper snapshot ≟ served JSON`) lives in [`contracts/app.parity.test.ts`](./contracts/app.parity.test.ts), run via `bun run test:contracts`.
