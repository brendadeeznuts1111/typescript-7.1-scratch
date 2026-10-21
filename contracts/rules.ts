import {
  envKeySetOnly,
  identity,
  mdShapeKeySort,
  sortKeysAndUnwrapReadonly,
} from "./lib/normalizers.ts";

export type ImportKind = "default" | "attribute-json" | "attribute-text";

export type FormatId =
  | "csv"
  | "tsv"
  | "toml"
  | "yaml"
  | "jsonc"
  | "json5"
  | "md"
  | "txt"
  | "json"
  | "env";

export type ExceptionApplies = "types-only" | "runtime-only" | "env-side-effect";

export type NormalizeRule = {
  format: FormatId;
  extensions: readonly `.${string}`[];
  importKinds: readonly ImportKind[];
  /** Applied to mapper and runtime arms before compare */
  normalize: (value: unknown) => unknown;
  exception?: {
    reason: string;
    applies: ExceptionApplies;
  };
  /** When false, harness skips file parity (see exception) */
  fileParity: boolean;
};

export const rules: Record<FormatId, NormalizeRule> = {
  csv: {
    format: "csv",
    extensions: [".csv"],
    importKinds: ["default"],
    normalize: identity,
    fileParity: true,
  },
  tsv: {
    format: "tsv",
    extensions: [".tsv"],
    importKinds: ["default"],
    normalize: identity,
    fileParity: true,
  },
  toml: {
    format: "toml",
    extensions: [".toml"],
    importKinds: ["default"],
    normalize: sortKeysAndUnwrapReadonly,
    fileParity: true,
  },
  yaml: {
    format: "yaml",
    extensions: [".yaml", ".yml"],
    importKinds: ["default"],
    normalize: sortKeysAndUnwrapReadonly,
    fileParity: true,
  },
  jsonc: {
    format: "jsonc",
    extensions: [".jsonc"],
    importKinds: ["default"],
    normalize: sortKeysAndUnwrapReadonly,
    fileParity: true,
  },
  json5: {
    format: "json5",
    extensions: [".json5"],
    importKinds: ["default"],
    normalize: sortKeysAndUnwrapReadonly,
    fileParity: true,
  },
  md: {
    format: "md",
    extensions: [".md"],
    importKinds: ["default"],
    normalize: mdShapeKeySort,
    fileParity: true,
  },
  txt: {
    format: "txt",
    extensions: [".txt"],
    importKinds: ["default"],
    normalize: identity,
    fileParity: true,
  },
  json: {
    format: "json",
    extensions: [".json"],
    importKinds: ["attribute-json"],
    normalize: sortKeysAndUnwrapReadonly,
    fileParity: true,
    exception: {
      reason:
        "motherload emits as-const literals; Bun `with { type: \"json\" }` widens — runtime shape parity only",
      applies: "types-only",
    },
  },
  env: {
    format: "env",
    extensions: [".env"],
    importKinds: ["default"],
    normalize: envKeySetOnly,
    fileParity: false,
    exception: {
      reason: "loadEnvFile is side-effecting; assert keys from fixture, not values from process.env",
      applies: "env-side-effect",
    },
  },
};

export const RULE_ENTRIES = Object.entries(rules) as [FormatId, NormalizeRule][];

export function ruleForPath(path: string): NormalizeRule | undefined {
  const dot = path.lastIndexOf(".");
  if (dot === -1) return undefined;
  const ext = path.slice(dot) as `.${string}`;
  return RULE_ENTRIES.find(([, rule]) => rule.extensions.includes(ext))?.[1];
}

export function receiptForRule(rule: NormalizeRule): string {
  if (rule.exception) {
    return `${rule.format} · exception (${rule.exception.applies}): ${rule.exception.reason}`;
  }
  return `${rule.format} · no documented exception — mapper and runtime must match after normalize`;
}
