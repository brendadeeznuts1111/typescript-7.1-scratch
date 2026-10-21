/**
 * Compile-time probe: dashboard.toml panel `type` should narrow (not plain string).
 * Run via `bun run typecheck:config-server` — if this fails, document widened types in the composition receipt.
 */
import dashboard from "../../playground/fixtures/dashboard.toml";

type Panel = (typeof dashboard)["panels"][number];
type PanelType = Panel["type"];

type _AssertUnion = PanelType extends "users" | "docs"
  ? "users" | "docs" extends PanelType
    ? true
    : never
  : never;

export function dashboardTypeProbe(panel: Panel): string {
  switch (panel.type) {
    case "users":
      return panel.source;
    case "docs":
      return panel.source;
    default: {
      const _exhaustive: never = panel;
      return _exhaustive;
    }
  }
}

const _unionOk: _AssertUnion = true;
