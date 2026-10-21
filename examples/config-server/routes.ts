import type { Database } from "bun:sqlite";
import type { RedisClient } from "bun";

import type { DashboardPayload } from "./dashboard.ts";
import { docFixtureFile, docFrontmatter, slugToFixture } from "./docs.ts";
import { insertUser, listUsers, type UserRow } from "./db.ts";
import type { LiveHub } from "./live.ts";
import { usersCacheKey } from "./redis.ts";

export function createHandlers(
  db: Database,
  live: LiveHub,
  redisClient: RedisClient | null,
  dashboard: DashboardPayload,
) {
  return {
    health(): Response {
      return Response.json({ ok: true });
    },

    dashboard(): Response {
      return Response.json(dashboard);
    },

    async users(): Promise<Response> {
      const key = usersCacheKey();
      if (redisClient) {
        const hit = await redisClient.get(key);
        if (hit) return Response.json(JSON.parse(hit));
      }
      const rows = listUsers(db);
      if (redisClient) {
        await redisClient.set(key, JSON.stringify(rows), "EX", 60);
      }
      return Response.json(rows);
    },

    async postUser(req: Request): Promise<Response> {
      let row: UserRow;
      try {
        row = (await req.json()) as UserRow;
      } catch {
        return new Response("Bad Request", { status: 400 });
      }
      if (!row?.name || !row?.email || !row?.zip) {
        return new Response("Bad Request", { status: 400 });
      }
      insertUser(db, row);
      // Broadcast before response so app-parity tests can assert sequentially:
      // await wsOpened → register listener → await fetch(POST) → await broadcast.
      await live.publishAsync({ type: "user.created", user: row });
      if (redisClient) {
        await redisClient.del(usersCacheKey());
      }
      return Response.json(row, { status: 201 });
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
