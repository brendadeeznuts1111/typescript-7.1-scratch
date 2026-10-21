import post, { frontmatter, md } from "../fixtures/post.md";
import * as postModule from "../fixtures/post.md";

import { type Equal, expect } from "../lib/assert.ts";

expect<
  Equal<
    typeof post,
    {
      readonly md: string;
      readonly frontmatter: {
        readonly title: "Hello, Motherload";
        readonly draft: false;
        readonly tags: readonly ["data", "types"];
      };
    }
  >
>();

expect<Equal<typeof frontmatter, typeof post.frontmatter>>();
expect<Equal<typeof md, typeof post.md>>();
expect<Equal<keyof typeof postModule, "default" | "md" | "frontmatter">>();

export function layerMarkdown() {
  return {
    layer: "01-markdown",
    title: frontmatter.title,
    draft: frontmatter.draft,
    tags: [...frontmatter.tags],
    heading: post.md.split("\n").find((line) => line.startsWith("#")),
    namedExportMatches: md === post.md,
  };
}
