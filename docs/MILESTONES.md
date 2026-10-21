# Enhancements — proposed scope

Cross-cutting invariants (all milestones):

- Mapper cache key = `(path, importKind)` only, process lifetime, no mtime.
- Fixtures are static; no mtime-based invalidation.
- CSV columns stay `TEXT` until M3 schema-inference decision lands.
- App-parity spawns always set `DB_PATH=:memory:` and `PORT=0`.
- `receiptForRule` output is deterministic — no paths, timestamps, or env values.

## M2 — Live surface

- [x] **`GET /docs/:slug/raw`** — `new Response(Bun.file(fixturePath))`; byte-equal smoke test (`rule: none, run-clock smoke`). Slug → path via `slugToFixture` only.
- [x] **`POST /users`** — SQLite insert → publish → response; WS `/live` via `fetch` + `server.upgrade`.
- [x] **Redis arm (conditional)** — default `redis` from `"bun"` when `REDIS_URL` set; `GET /users` cache + `POST` del; tests in `describe("app-level (redis)")`.
- [ ] **WS roundtrip test** — connect → POST → assert broadcast received → assert cache key state. Design for the POST-response / WS-delivery race explicitly.
- [ ] **WS handshake** — reuse `readStartupUrl`; derive `ws://host:port/live`.

**Scope guard:** no dynamic routes, no assets, no auth, no migrations.

## M3 — Full parity

- [x] **CSV motherload ≟ SQLite round-trip** — `app-csv-motherload-sqlite.parity.test.ts`: runtime preload import ≟ M1 seed (`ORDER BY rowid`, TEXT columns). Not a three-way label: preload arm B makes mapper ≟ runtime redundant with file parity; B ≟ C is storage fidelity.
- [x] **CSV two-clock arm** — Bun has no native CSV import; independent arm = `Bun.file().text()` + `csv-parse/sync` (`columns: true`, `bom: true`, `skip_empty_lines: true`) → `Array<Record<string, string>>`; **no adapter** (same shape as motherload). `contracts/csv-two-clock.parity.test.ts`.
- [x] **TOML two-clock arm** — `smol-toml` via `contracts/bin/native-toml-child.ts`; fixture `playground/fixtures/config-edge.toml` (underscore int, dates, inline table). `playground/fixtures/config.toml` is **not** used: smol-toml rejects its bigint / mixed-type arrays — documented parser surface gap, not coerced in tests.
- [x] **MD two-clock arm** — `contracts/md-two-clock.parity.test.ts` · `post.md` + `post-edge.md` (date string, multiline `|`). **Bun.markdown is a renderer, not a frontmatter parser** ([issue #26605](https://github.com/oven-sh/bun/issues/26605)). Arm B = frontmatter splitter (regex) + `Bun.YAML.parse` (tier 2, no devDep). Frontmatter parity + body text-equal; not two independent markdown renders. True `{ md, frontmatter }` via a second full MD parser deferred unless body-rendering parity is required.
- [ ] **`sample.env`** — side-effect contract via `rules.env`, not external-parser two-clock.
- **Two-clock matrix scope:** every fixture that flows through `config-server` gets an independent-parser arm when a honest external parser exists. Curriculum fixtures (layers 01–07 only) are compile-only and **excluded** — not 11 devDeps.

| Fixture | Consumer | Two-clock |
|---|---|---|
| `users.csv` | `db.ts` → `GET /users` | ✅ csv-parse |
| `config.toml` (app) / `config-edge.toml` (contract) | `config.ts` | ✅ smol-toml (`config-edge.toml`) |
| `post.md` / `post-edge.md` | `docs.ts` | ✅ Bun.YAML.parse + split |
| `sample.env` | `loadEnvFile` | env rule, not matrix |
- [ ] **Layer 08 attribute arm wired into harness** — same process, `with { type: "json" }` vs mapper path; parity asserted via existing normalizer.
- [ ] **`env` contract formalized** — keys-present assertions against `sample.env`; document `loadEnvFile` side-effect boundary in `contracts/README.md`.

**Scope guard:** normalizer rules stay data-driven; no ad-hoc `switch (format)` reintroduced.

## M4 — Hardening

- [ ] **`ci:local` drift gate** — `test:contracts` already runs; add receipt-artifact upload on failure so drift diffs are inspectable across runs.
- [ ] **Receipt determinism audit** — assert no absolute paths / timestamps / `process.env` values leak into `receiptForRule` output (currently static; lock it with a meta-test).
- [ ] **Secret redaction** — logs + receipt snapshots scrub `.env` values.
- [ ] **Bump-path doc** — `contracts/README.md` gains a "re-pin motherload + re-run `ci:local`" checklist tied to the `typescript@beta` resolution step already documented.

## Deferred / not planned

- Redis/WS dynamic routes beyond `/live` (M2+ only if a contract demands it).
- JSON Schema via `dotschema` — separate package, separate milestone if adopted.
- Bundler/Jest integrations (`motherload@0.2.0`) — out of scope for the Bun preload story.

## M2 implementation notes

- **Startup / WS URL:** `app.ts` prints `listening on http://127.0.0.1:<port>` to stdout; parity tests parse it today — derive `ws://<host>:<port>/live` from the same line.
- **POST vs WS race:** register WS client and wait for `open` before `POST`; after POST, use `Promise.race` with a timeout and a queue fed by `server.publish` (or per-socket `send`) so the test fails if broadcast never arrives.
- **`/docs/:slug/raw`:** response body is the **full file bytes** (includes frontmatter); compare to `Bun.file` read in test, not to `rules.md.normalize(mapper).md`.
