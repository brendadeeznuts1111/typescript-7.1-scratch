# IntelliSense markdown example

Same layout as the motherload demo: `notes.md` + `import notes from "./notes.md"`.

Hover `notes` to see `{ md, frontmatter }` with literal `title` and `tags`.

```bash
bun run typecheck:example
bun run example:intellisense
```

Workspace TS 7.1 + trusted folder for editor hovers.
