import dashboardToml from "../../playground/fixtures/dashboard.toml";
import postMd from "../../playground/fixtures/post.md";
import usersCsv from "../../playground/fixtures/users.csv";

import type { UserRow } from "./db.ts";

export type DashboardConfig = typeof dashboardToml;
export type DashboardPanelConfig = DashboardConfig["panels"][number];

export type DashboardPayload = {
  title: string;
  panels: { type: string; data: unknown }[];
};

const FIXTURES = new URL("../../playground/fixtures/", import.meta.url);

/** Served view for users panels (matches LIST_USERS_SQL ordering). */
export function servedUsersPanelData(rows: readonly UserRow[]): UserRow[] {
  return [...rows].sort(
    (a, b) => a.name.localeCompare(b.name) || a.email.localeCompare(b.email),
  );
}

/** Served view for docs panels — full typed MD import shape. */
export function servedDocsPanelData(doc: typeof postMd) {
  return { frontmatter: doc.frontmatter, md: doc.md };
}

async function assertFixtureExists(source: string): Promise<void> {
  const file = Bun.file(new URL(source, FIXTURES));
  if (!(await file.exists())) {
    throw new Error(`dashboard: missing source fixture playground/fixtures/${source}`);
  }
}

/**
 * Resolve panel data at startup (static). Unknown type/source or missing file → throw.
 * Depth-1 only: source must name a leaf file, not another composition.
 */
export async function buildDashboardFromConfig(
  config: { title: string; panels: readonly { type: string; source: string }[] },
): Promise<DashboardPayload> {
  const panels: DashboardPayload["panels"] = [];

  for (const panel of config.panels) {
    const { type, source } = panel;
    await assertFixtureExists(source);

    if (type === "users") {
      if (source !== "users.csv") {
        throw new Error(`dashboard: unsupported users source ${JSON.stringify(source)}`);
      }
      panels.push({ type: "users", data: servedUsersPanelData(usersCsv) });
      continue;
    }

    if (type === "docs") {
      if (source !== "post.md") {
        throw new Error(`dashboard: unsupported docs source ${JSON.stringify(source)}`);
      }
      panels.push({ type: "docs", data: servedDocsPanelData(postMd) });
      continue;
    }

    throw new Error(`dashboard: unknown panel type ${JSON.stringify(type)}`);
  }

  return { title: config.title, panels };
}

export async function loadDashboard(): Promise<DashboardPayload> {
  return buildDashboardFromConfig(dashboardToml);
}
