import type { Database } from "bun:sqlite";

import { docFixtureFile, docFrontmatter, slugToFixture } from "./docs.ts";
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
      const fx = slugToFixture(slug);
      if (!fx || !(await fx.file.exists())) return new Response("Not Found", { status: 404 });
      const md = fx.doc.md;
      return new Response(md, {
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
      });
    },

    async docsRaw(slug: string): Promise<Response> {
      const file = docFixtureFile(slug);
      if (!file || !(await file.exists())) return new Response("Not Found", { status: 404 });
      return new Response(file, {
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
      });
    },
  };
}
