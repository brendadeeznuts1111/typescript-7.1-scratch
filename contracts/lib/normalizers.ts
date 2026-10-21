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

export function identity(value: unknown): unknown {
  return value;
}

/** Mutable vs readonly is type-only; compare sorted key shape and numbers. */
export function sortKeysAndUnwrapReadonly(value: unknown): unknown {
  return numberNormalize(dropUndefinedDeep(sortKeysDeep(value)));
}

export function mdShapeKeySort(value: unknown): unknown {
  if (!isPlainObject(value) || typeof value.md !== "string" || !isPlainObject(value.frontmatter)) {
    return value;
  }
  return {
    md: value.md,
    frontmatter: sortKeysDeep(value.frontmatter),
  };
}

/** Parsed fixture keys/values only — not process.env after loadEnvFile. */
export function envKeySetOnly(value: unknown): unknown {
  return value;
}
