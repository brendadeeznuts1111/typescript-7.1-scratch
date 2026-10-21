/** Stable IDs — referenced in test output, CI artifacts, and Layer 08 docs */
export type ExceptionId =
  | "none"
  | "plain-json-type-clock-widened"
  | "env-side-effect-no-process-env"
  | "app-level-sql-redis";

export type ImportKind = "default" | "attribute-json" | "attribute-text";

export type FormatId = "csv" | "tsv" | "toml" | "yaml" | "jsonc" | "json5" | "md" | "txt" | "json-plain" | "env";

export type NormalizeStep =
  | "identity"
  | "sortKeysDeep"
  | "dropUndefinedDeep"
  | "numberNormalize"
  | "mdShape"
  | "envFixtureKeysOnly";

export type FormatRule = {
  format: FormatId;
  extensions: readonly `.${string}`[];
  importKinds: readonly ImportKind[];
  normalize: {
    mapper: readonly NormalizeStep[];
    runtime: readonly NormalizeStep[];
  };
  exception: ExceptionId;
  rationale: string;
  fileParity: boolean;
};

export const FORMAT_RULES: readonly FormatRule[] = [
  {
    format: "csv",
    extensions: [".csv"],
    importKinds: ["default"],
    normalize: { mapper: ["identity"], runtime: ["identity"] },
    exception: "none",
    rationale: "Cells are strings both sides.",
    fileParity: true,
  },
  {
    format: "tsv",
    extensions: [".tsv"],
    importKinds: ["default"],
    normalize: { mapper: ["identity"], runtime: ["identity"] },
    exception: "none",
    rationale: "",
    fileParity: true,
  },
  {
    format: "toml",
    extensions: [".toml"],
    importKinds: ["default"],
    normalize: {
      mapper: ["sortKeysDeep", "dropUndefinedDeep", "numberNormalize"],
      runtime: ["sortKeysDeep", "dropUndefinedDeep", "numberNormalize"],
    },
    exception: "none",
    rationale: "Mutable vs readonly is type-only; value shape must match.",
    fileParity: true,
  },
  {
    format: "yaml",
    extensions: [".yaml", ".yml"],
    importKinds: ["default"],
    normalize: {
      mapper: ["sortKeysDeep", "dropUndefinedDeep", "numberNormalize"],
      runtime: ["sortKeysDeep", "dropUndefinedDeep", "numberNormalize"],
    },
    exception: "none",
    rationale: "",
    fileParity: true,
  },
  {
    format: "jsonc",
    extensions: [".jsonc"],
    importKinds: ["default"],
    normalize: {
      mapper: ["sortKeysDeep", "dropUndefinedDeep", "numberNormalize"],
      runtime: ["sortKeysDeep", "dropUndefinedDeep", "numberNormalize"],
    },
    exception: "none",
    rationale: "",
    fileParity: true,
  },
  {
    format: "json5",
    extensions: [".json5"],
    importKinds: ["default"],
    normalize: {
      mapper: ["sortKeysDeep", "dropUndefinedDeep", "numberNormalize"],
      runtime: ["sortKeysDeep", "dropUndefinedDeep", "numberNormalize"],
    },
    exception: "none",
    rationale: "",
    fileParity: true,
  },
  {
    format: "md",
    extensions: [".md"],
    importKinds: ["default"],
    normalize: { mapper: ["mdShape"], runtime: ["mdShape"] },
    exception: "none",
    rationale: "md byte-equal; frontmatter key-sorted.",
    fileParity: true,
  },
  {
    format: "txt",
    extensions: [".txt"],
    importKinds: ["default"],
    normalize: { mapper: ["identity"], runtime: ["identity"] },
    exception: "none",
    rationale: "",
    fileParity: true,
  },
  {
    format: "json-plain",
    extensions: [".json"],
    importKinds: ["attribute-json"],
    normalize: {
      mapper: ["sortKeysDeep", "dropUndefinedDeep", "numberNormalize"],
      runtime: ["sortKeysDeep", "dropUndefinedDeep", "numberNormalize"],
    },
    exception: "plain-json-type-clock-widened",
    rationale: "Type clock may widen; contract is runtime shape only.",
    fileParity: true,
  },
  {
    format: "env",
    extensions: [".env"],
    importKinds: ["default"],
    normalize: { mapper: ["envFixtureKeysOnly"], runtime: ["envFixtureKeysOnly"] },
    exception: "env-side-effect-no-process-env",
    rationale: "Compare parsed fixture; loadEnvFile is separate app contract.",
    fileParity: false,
  },
];

export function ruleForPath(path: string): FormatRule | undefined {
  const dot = path.lastIndexOf(".");
  if (dot === -1) return undefined;
  const ext = path.slice(dot) as `.${string}`;
  return FORMAT_RULES.find((r) => r.extensions.includes(ext));
}
