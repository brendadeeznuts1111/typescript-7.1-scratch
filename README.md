# TypeScript 7.1 scratch

Playground for [TypeScript 7.1 content mappers](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/) and [motherload](https://github.com/colinhacks/motherload).

**Upstream:** [colinhacks/motherload](https://github.com/colinhacks/motherload) · [motherload.dev](https://motherload.dev) · playground fixtures from [`lab/basic`](https://github.com/colinhacks/motherload/tree/main/lab/basic). This repo pins **`motherload@0.1.0`**; upstream is at **0.2.0** ([pin](https://github.com/colinhacks/motherload/commit/f9e9fabc8b1131010bd614d8b48aa765804f9d19)). Runtime here uses `bun --preload motherload/register` (Node uses `--import motherload/register`).

Thread: [@colinhacks on content mappers](https://x.com/colinhacks/status/2112954197373259850) and the [IntelliSense screenshot](https://x.com/colinhacks/status/2112954199843758219) (“mother of all content mappers”). Layer 01 mirrors that `.md` + frontmatter hover story; fixtures come from motherload `lab/basic`, not from X media.

Requires [Bun](https://bun.com) and TypeScript 7.1 beta. MIT licensed — see [LICENSE](./LICENSE).

## Setup

```bash
bun install
```

### Minimal IntelliSense example

```bash
bun run typecheck:example
```

Then open [`examples/intellisense-markdown/main.ts`](examples/intellisense-markdown/main.ts) and hover `notes`. See [examples/intellisense-markdown/README.md](examples/intellisense-markdown/README.md).

TOML hover (pricing tables): [`examples/intellisense-toml/main.ts`](examples/intellisense-toml/main.ts) + `plans.toml` — `bun run typecheck:example-toml`.

CSV hover (header-typed rows): [`examples/intellisense-csv/main.ts`](examples/intellisense-csv/main.ts) + `posts.csv` — `bun run typecheck:example-csv`.

## Playground

Type-check imports of `.md`, `.toml`, and other data files (requires `tsc --runExternalCode`):

```bash
bun run typecheck:playground
```

Run with motherload's Bun preload (loads file contents at runtime):

```bash
bun run playground
```

See [playground/README.md](./playground/README.md) for the nine-layer tour. Edit fixtures under `playground/fixtures/` and the matching layer file — types update when you re-run typecheck.

## Notes

- Content mappers are configured in `playground/tsconfig.json` under `contentMappers`. Full reference block (screenshot parity): [examples/motherload-tsconfig.reference.jsonc](examples/motherload-tsconfig.reference.jsonc).
- Root `bun check` does not enable `--runExternalCode` yet; use `typecheck:playground` for mapper-aware checking.
- **IntelliSense like Colin’s screenshot:** open `playground/layers/01-markdown.ts`, use **TypeScript: Select Version from Workspace** (TS 7.1 beta from `node_modules`), and a **trusted** workspace so content mappers run in the language service. Hover `post` or `frontmatter` — you should see literal types (`"Hello, Motherload"`, `readonly tags: …`). Command line equivalent: `bun run typecheck:playground`.
