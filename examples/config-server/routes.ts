import type { Database } from "bun:sqlite";

import { docBodyStream, docFrontmatter } from "./docs.ts";
import { listUsers } from "./db.ts";

export function createHandlers(db: Database) {
  return {
    health(): Response {
      return Response.json({ ok: true });
    },

    users(): Response {
      return Response.json(listUsers(db));
    },

    async docs(slug: string): Promise<Response> {
      const frontmatter = docFrontmatter(slug);
      if (!frontmatter) return new Response("Not Found", { status: 404 });
      const file = await docBodyStream(slug);
      if (!file) return new Response("Not Found", { status: 404 });
      const body = await file.text();
      return Response.json({ slug, frontmatter, md: body });
    },
  };
}
