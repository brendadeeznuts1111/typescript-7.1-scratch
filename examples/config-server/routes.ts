import type { Database } from "bun:sqlite";

import { docBodyStream, docFrontmatter, docMarkdownBody } from "./docs.ts";
import { listUsers } from "./db.ts";

export function createHandlers(db: Database) {
  return {
    health(): Response {
      return Response.json({ ok: true });
    },

    users(): Response {
      return Response.json(listUsers(db));
    },

    docsFrontmatter(slug: string): Response {
      const frontmatter = docFrontmatter(slug);
      if (!frontmatter) return new Response("Not Found", { status: 404 });
      return Response.json({ slug, frontmatter });
    },

    async docsBody(slug: string): Promise<Response> {
      const frontmatter = docFrontmatter(slug);
      if (!frontmatter) return new Response("Not Found", { status: 404 });
      const file = await docBodyStream(slug);
      if (!file || !(await file.exists())) return new Response("Not Found", { status: 404 });
      const md = docMarkdownBody(slug);
      if (md === null) return new Response("Not Found", { status: 404 });
      // HTTP body = motherload `md`. Bun.file proves the fixture path resolves at runtime.
      return new Response(md, {
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
      });
    },
  };
}
