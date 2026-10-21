import post from "../../playground/fixtures/post.md";

type DocModule = typeof post;

type SlugFixture = {
  /** Repo-relative path (single source for disk + future matrix) */
  repoRelative: string;
  file: ReturnType<typeof Bun.file>;
  doc: DocModule;
};

const SLUG_FIXTURES: Record<string, Omit<SlugFixture, "file"> & { fileUrl: URL }> = {
  hello: {
    repoRelative: "playground/fixtures/post.md",
    fileUrl: new URL("../../playground/fixtures/post.md", import.meta.url),
    doc: post,
  },
};

/** One lookup for every `/docs/:slug*` route — do not duplicate slug → path elsewhere. */
export function slugToFixture(slug: string): SlugFixture | null {
  const entry = SLUG_FIXTURES[slug];
  if (!entry) return null;
  return {
    repoRelative: entry.repoRelative,
    file: Bun.file(entry.fileUrl),
    doc: entry.doc,
  };
}

export function docFrontmatter(slug: string) {
  return slugToFixture(slug)?.doc.frontmatter ?? null;
}

export function docMarkdownBody(slug: string) {
  return slugToFixture(slug)?.doc.md ?? null;
}

export function docFixtureFile(slug: string) {
  return slugToFixture(slug)?.file ?? null;
}
