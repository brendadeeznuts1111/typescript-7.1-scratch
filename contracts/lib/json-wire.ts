export function wireStringify(value: unknown): string {
  return JSON.stringify(value, (_key, v) => {
    if (typeof v === "bigint") return { __motherloadBigInt: v.toString() };
    if (v instanceof Date) return { __motherloadDate: v.toISOString() };
    return v;
  });
}

export function wireParse(text: string): unknown {
  return JSON.parse(text, (_key, v) => {
    if (v !== null && typeof v === "object") {
      const o = v as Record<string, unknown>;
      if (typeof o.__motherloadBigInt === "string") return BigInt(o.__motherloadBigInt);
      if (typeof o.__motherloadDate === "string") return new Date(o.__motherloadDate);
    }
    return v;
  });
}
