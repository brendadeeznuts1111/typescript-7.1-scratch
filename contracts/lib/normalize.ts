import type { FormatId, NormalizeStep } from "../rules.ts";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function sortKeysDeep(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (!isPlainObject(value)) return value;
  const out: Record<string, unknown> = Object.create(null);
  for (const key of Object.keys(value).sort()) {
    out[key] = sortKeysDeep(value[key]);
  }
  return out;
}

function dropUndefinedDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(dropUndefinedDeep);
  if (!isPlainObject(value)) return value;
  const out: Record<string, unknown> = Object.create(null);
  for (const [key, v] of Object.entries(value)) {
    if (v === undefined) continue;
    out[key] = dropUndefinedDeep(v);
  }
  return out;
}

function numberNormalize(value: unknown): unknown {
  if (typeof value === "number") {
    if (Number.isNaN(value)) return "NaN";
    if (value === Infinity) return "Infinity";
    if (value === -Infinity) return "-Infinity";
    if (Object.is(value, -0)) return "-0";
    return value;
  }
  if (Array.isArray(value)) return value.map(numberNormalize);
  if (!isPlainObject(value)) return value;
  const out: Record<string, unknown> = Object.create(null);
  for (const [key, v] of Object.entries(value)) {
    out[key] = numberNormalize(v);
  }
  return out;
}

function mdShape(value: unknown): unknown {
  if (!isPlainObject(value) || typeof value.md !== "string" || !isPlainObject(value.frontmatter)) {
    return value;
  }
  return {
    md: value.md,
    frontmatter: sortKeysDeep(value.frontmatter),
  };
}

/** Env arm compares parsed key/value map from fixture text, not process.env. */
function envFixtureKeysOnly(value: unknown): unknown {
  return value;
}

const STEP_FNS: Record<NormalizeStep, (v: unknown) => unknown> = {
  identity: (v) => v,
  sortKeysDeep,
  dropUndefinedDeep,
  numberNormalize,
  mdShape,
  envFixtureKeysOnly,
};

export function applyNormalizeSteps(value: unknown, steps: readonly NormalizeStep[]): unknown {
  let out = value;
  for (const step of steps) {
    out = STEP_FNS[step](out);
  }
  return out;
}

export function normalizeForCompare(
  value: unknown,
  steps: readonly NormalizeStep[],
  _format: FormatId,
): unknown {
  return applyNormalizeSteps(value, steps);
}
