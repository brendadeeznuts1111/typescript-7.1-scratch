# TypeScript 7.1 scratch

Playground for [TypeScript 7.1 content mappers](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/) and [motherload](https://github.com/colinhacks/motherload).

Thread: [@colinhacks on content mappers](https://x.com/colinhacks/status/2112954197373259850) and the [IntelliSense screenshot](https://x.com/colinhacks/status/2112954199843758219) (“mother of all content mappers”). Layer 01 mirrors that `.md` + frontmatter hover story; fixtures come from motherload `lab/basic`, not from X media.

Requires [Bun](https://bun.com) and TypeScript 7.1 beta. MIT licensed — see [LICENSE](./LICENSE).

## Setup

```bash
bun install
```

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

- Content mappers are configured in `playground/tsconfig.json` under `contentMappers`.
- Root `bun check` does not enable `--runExternalCode` yet; use `typecheck:playground` for mapper-aware checking.
- **IntelliSense like Colin’s screenshot:** open `playground/layers/01-markdown.ts`, use **TypeScript: Select Version from Workspace** (TS 7.1 beta from `node_modules`), and a **trusted** workspace so content mappers run in the language service. Hover `post` or `frontmatter` — you should see literal types (`"Hello, Motherload"`, `readonly tags: …`). Command line equivalent: `bun run typecheck:playground`.
