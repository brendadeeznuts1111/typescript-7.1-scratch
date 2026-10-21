import post from "../../playground/fixtures/post.md";

const DOCS: Record<string, typeof post> = {
  hello: post,
};

export function docFrontmatter(slug: string) {
  const doc = DOCS[slug];
  if (!doc) return null;
  return doc.frontmatter;
}

export function docMarkdownBody(slug: string) {
  const doc = DOCS[slug];
  if (!doc) return null;
  return doc.md;
}

export async function docBodyStream(slug: string) {
  const doc = DOCS[slug];
  if (!doc) return null;
  const path = new URL("../../playground/fixtures/post.md", import.meta.url);
  return Bun.file(path);
}
