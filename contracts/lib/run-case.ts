import type { FixtureCase } from "../manifest.ts";
import { receiptForRule, ruleForPath } from "../rules.ts";
import { deepEqual, stableStringify } from "./compare.ts";
import { absoluteFixturePath } from "./paths.ts";
import { mapperCodegenSnapshot, runtimeImportSnapshot } from "./spawn-value.ts";

export type CaseResult =
  | { status: "pass"; caseId: string; format: string; receipt: string }
  | { status: "skip"; caseId: string; reason: string; receipt?: string }
  | {
      status: "fail";
      caseId: string;
      format: string;
      receipt: string;
      diff: { mapper: string; runtime: string };
    };

export async function runParityCase(c: FixtureCase): Promise<CaseResult> {
  const rule = ruleForPath(c.path);
  if (!rule) {
    return { status: "skip", caseId: c.id, reason: "no format rule in contracts/rules.ts" };
  }

  const receipt = receiptForRule(rule);

  if (!rule.fileParity) {
    return { status: "skip", caseId: c.id, reason: rule.exception?.reason ?? "fileParity: false", receipt };
  }
  if (!rule.importKinds.includes(c.importKind)) {
    return {
      status: "skip",
      caseId: c.id,
      reason: `importKind ${c.importKind} not listed on rule`,
      receipt,
    };
  }

  const absPath = absoluteFixturePath(c.path);
  const mapperRaw = await mapperCodegenSnapshot(c, absPath);
  const runtimeRaw = await runtimeImportSnapshot(c, absPath);

  const mapperNorm = rule.normalize(mapperRaw);
  const runtimeNorm = rule.normalize(runtimeRaw);

  if (deepEqual(mapperNorm, runtimeNorm)) {
    return { status: "pass", caseId: c.id, format: rule.format, receipt };
  }

  return {
    status: "fail",
    caseId: c.id,
    format: rule.format,
    receipt,
    diff: {
      mapper: stableStringify(mapperNorm),
      runtime: stableStringify(runtimeNorm),
    },
  };
}
