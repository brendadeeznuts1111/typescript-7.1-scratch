# Examples

## IntelliSense (one format each)

| Format | Folder | Typecheck |
|--------|--------|-----------|
| Markdown + frontmatter | [intellisense-markdown](./intellisense-markdown/) | `bun run typecheck:example` |
| TOML literals | [intellisense-toml](./intellisense-toml/) | `bun run typecheck:example-toml` |
| CSV header rows | [intellisense-csv](./intellisense-csv/) | `bun run typecheck:example-csv` |

## `contentMappers` reference

Full `tsconfig` snippet (including `.schema.jsonc` as in motherload demos):

[motherload-tsconfig.reference.jsonc](./motherload-tsconfig.reference.jsonc)

Playground uses the same motherload extension set minus `.schema.jsonc` (use [dotschema](https://www.npmjs.com/package/dotschema) for schema files).
