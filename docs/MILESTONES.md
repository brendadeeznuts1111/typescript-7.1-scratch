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

- [ ] **Three-way CSV contract** — mapper ≟ Bun import ≟ SQLite round-trip. Requires deciding schema inference policy (currently `TEXT`-only). This is the decision that unblocks it.
- [ ] **All 11 fixtures in conformance matrix** — extend `app.parity.test.ts` coverage beyond `users.csv` + `post.md`.
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
