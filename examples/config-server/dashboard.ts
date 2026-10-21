import dashboardToml from "../../playground/fixtures/dashboard.toml";
import postMd from "../../playground/fixtures/post.md";

import { usersServeRowsFromSeed } from "./db.ts";

export type DashboardConfig = typeof dashboardToml;
export type DashboardPanelConfig = DashboardConfig["panels"][number];

export type DashboardPayload = {
  title: string;
  panels: { type: string; data: unknown }[];
};

const FIXTURES = new URL("../../playground/fixtures/", import.meta.url);

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
 * Test-only injection for bad-config cases. App startup uses loadDashboard() only.
 * buildDashboardFromConfig accepts runtime { type, source }[] — not the typed import cast.
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
      panels.push({ type: "users", data: usersServeRowsFromSeed() });
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

/** App path: typed dashboard.toml import only. */
export async function loadDashboard(): Promise<DashboardPayload> {
  return buildDashboardFromConfig(dashboardToml);
}
