# TypeScript 7.1 scratch

Playground for [TypeScript 7.1 content mappers](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/) and [motherload](https://github.com/colinhacks/motherload).

**Upstream:** [colinhacks/motherload](https://github.com/colinhacks/motherload) · [motherload.dev](https://motherload.dev) · fixtures from [`lab/basic`](https://github.com/colinhacks/motherload/tree/main/lab/basic). This repo matches npm **[motherload v0.1.0](https://github.com/colinhacks/motherload/releases/tag/v0.1.0)** (tag `1e3fad2`: unified content mapper, eight format packages, JSON Schema moved to [dotschema](https://www.npmjs.com/package/dotschema)). Latest upstream is **[v0.2.0](https://github.com/colinhacks/motherload/releases/tag/v0.2.0)** (webpack / turbopack / vite / jest plugins). Runtime here: `bun --preload motherload/register` (Node: `--import motherload/register`). Contract tests in [`contracts/`](contracts/) assert mapper codegen vs preload parity on shared fixtures.

Thread: [@colinhacks on content mappers](https://x.com/colinhacks/status/2112954197373259850) and the [IntelliSense screenshot](https://x.com/colinhacks/status/2112954199843758219) (“mother of all content mappers”). Layer 01 mirrors that `.md` + frontmatter hover story; fixtures come from motherload `lab/basic`, not from X media.

Requires [Bun](https://bun.com) and TypeScript **7.1 beta** (npm tag **`beta`**, not `next`). MIT licensed — see [LICENSE](./LICENSE).

## Setup

Pins match [motherload v0.1.0](https://github.com/colinhacks/motherload/releases/tag/v0.1.0): **`motherload@0.1.0`** and **`typescript@beta`** (exact `7.1.0-beta` in `package.json` — verify with `npm view typescript@beta version` before changing). Do not use `typescript@next`; the `next` tag can move past the 7.1 beta that documents `contentMappers` and `--runExternalCode`.

```bash
bun install
```

npm equivalent (upstream docs canon):

```bash
npm install -D motherload@0.1.0 typescript@beta
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

See [playground/README.md](./playground/README.md) for the nine-layer tour. Roadmap: [docs/MILESTONES.md](./docs/MILESTONES.md). Edit fixtures under `playground/fixtures/` and the matching layer file — types update when you re-run typecheck.

## Notes

- Content mappers are configured in `playground/tsconfig.json` under `contentMappers`. Full reference block (screenshot parity): [examples/motherload-tsconfig.reference.jsonc](examples/motherload-tsconfig.reference.jsonc).
- Root `bun check` does not enable `--runExternalCode` yet; use `typecheck:playground` for mapper-aware checking.
- **IntelliSense like Colin’s screenshot:** open `playground/layers/01-markdown.ts`, use **TypeScript: Select Version from Workspace** (TS 7.1 beta from `node_modules`), and a **trusted** workspace so content mappers run in the language service. Hover `post` or `frontmatter` — you should see literal types (`"Hello, Motherload"`, `readonly tags: …`). Command line equivalent: `bun run typecheck:playground`.
