export function deepEqual(a: unknown, b: unknown): boolean {
  return stableStringify(a) === stableStringify(b);
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortForJson(value));
}

function sortForJson(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(sortForJson);
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = Object.create(null);
    for (const key of Object.keys(obj).sort()) {
      out[key] = sortForJson(obj[key]);
    }
    return out;
  }
  return value;
}
