# TypeScript 7.1 scratch

[![CI](https://github.com/brendadeeznuts1111/typescript-7.1-scratch/actions/workflows/ci.yml/badge.svg)](https://github.com/brendadeeznuts1111/typescript-7.1-scratch/actions/workflows/ci.yml)

Playground for [TypeScript 7.1 content mappers](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/) and [motherload](https://github.com/colinhacks/motherload) — the pattern [@colinhacks](https://x.com/colinhacks/status/2112954197373259850) demoed with typed Markdown frontmatter imports.

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
- In Cursor/VS Code, use the TypeScript 7.1 language server in a trusted workspace so editor types match `tsc`.
