import type { FixtureCase } from "../manifest.ts";
import { ruleForPath } from "../rules.ts";
import { deepEqual, stableStringify } from "./compare.ts";
import { normalizeForCompare } from "./normalize.ts";
import { absoluteFixturePath } from "./paths.ts";
import { mapperCodegenSnapshot, runtimeImportSnapshot } from "./spawn-value.ts";

export type CaseResult =
  | { status: "pass"; caseId: string }
  | { status: "skip"; caseId: string; reason: string }
  | {
      status: "fail";
      caseId: string;
      diff: { mapper: string; runtime: string };
      exception: string;
    };

export async function runParityCase(c: FixtureCase): Promise<CaseResult> {
  const rule = ruleForPath(c.path);
  if (!rule) {
    return { status: "skip", caseId: c.id, reason: "no format rule" };
  }
  if (!rule.fileParity) {
    return { status: "skip", caseId: c.id, reason: rule.rationale || rule.exception };
  }
  if (!rule.importKinds.includes(c.importKind)) {
    return { status: "skip", caseId: c.id, reason: `importKind ${c.importKind} not in rule` };
  }

  const absPath = absoluteFixturePath(c.path);
  const mapperRaw = await mapperCodegenSnapshot(c, absPath);
  const runtimeRaw = await runtimeImportSnapshot(c, absPath);

  const mapperNorm = normalizeForCompare(mapperRaw, rule.normalize.mapper, rule.format);
  const runtimeNorm = normalizeForCompare(runtimeRaw, rule.normalize.runtime, rule.format);

  if (deepEqual(mapperNorm, runtimeNorm)) {
    return { status: "pass", caseId: c.id };
  }

  return {
    status: "fail",
    caseId: c.id,
    exception: rule.exception,
    diff: {
      mapper: stableStringify(mapperNorm),
      runtime: stableStringify(runtimeNorm),
    },
  };
}
