# Contract tests (type clock vs run clock)

Proves **semantic equality** between:

1. **Mapper/codegen arm** — isolated child runs `plugin.load()` (same payload motherload embeds at runtime).
2. **Runtime arm** — fresh `bun --preload motherload/register` child imports the fixture file.

The test parent process is never preloaded. Mapper snapshots are cached per `(path, importKind)`.

## Run

```bash
bun test contracts
```

Wired into `bun run ci:local` after playground typecheck. Validated against **[motherload v0.1.0](https://github.com/colinhacks/motherload/releases/tag/v0.1.0)** and **`typescript@beta`** (`7.1.0-beta` in the lockfile), same as `package.json`. Confirm with `npm view typescript@beta version` before bumping the exact `typescript` string in `package.json`; re-run `bun run ci:local` after any compiler or motherload pin change.

## Rules

See [`rules.ts`](./rules.ts) for per-format normalizers and documented exceptions. Cases are listed in [`manifest.ts`](./manifest.ts) (M1: csv, tsv, toml).
