# Layered playground

Each file under `layers/` is one slice of the TS 7.1 + motherload stack. Fixtures come from [motherload `lab/basic`](https://github.com/colinhacks/motherload/tree/main/lab/basic).

| Layer | File | What it exercises |
| ----- | ---- | ----------------- |
| 00 | `00-stack.ts` | Type time (content mappers + `--runExternalCode`) vs run time (`bun --preload`) |
| 01 | `01-markdown.ts` | `.md` → `{ md, frontmatter }` + named exports |
| 02 | `02-toml.ts` | Literals, dates, bigint, nested tables |
| 03 | `03-yaml.ts` | Merge keys, multi-document YAML |
| 04 | `04-json-family.ts` | `.jsonc`, `.json5`, and plain `.json` with `with { type: "json" }` |
| 05 | `05-tabular.ts` | `.csv` / `.tsv` row typing from headers |
| 06 | `06-env-text.ts` | `.txt` at run time; `.env` typed in `06-env-types.ts` (see below) |
| 07 | `07-type-guards.ts` | `@ts-expect-error` regressions |
| 08 | `08-bun-import-attributes.ts` | Bun `with { type: "text" \| "json" }` vs mapper-owned extensions |

## `.env` on Bun

`import "./fixtures/sample.env"` is type-checked in `06-env-types.ts` (included by tsconfig, not imported from `main.ts`). The fixture is committed as `sample.env` so real secrets can stay in gitignored root `.env` files. At run time, layer 06 calls `process.loadEnvFile` with a string path because motherload's generated module passes a `URL` that Bun's `loadEnvFile` rejects.

## Commands

```bash
bun run typecheck:playground
bun run playground
```
