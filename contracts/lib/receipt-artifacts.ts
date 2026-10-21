import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { startupConfigForLog } from "../../examples/config-server/config.ts";
import { Redacted } from "../../examples/config-server/redacted.ts";
import { RULE_ENTRIES, receiptForRule } from "../rules.ts";
import type { CaseResult } from "./run-case.ts";
import { REPO_ROOT } from "./paths.ts";

export const CONTRACT_ARTIFACTS_DIR = join(REPO_ROOT, "artifacts/contracts");

export function ensureContractArtifactsDir(): void {
  mkdirSync(CONTRACT_ARTIFACTS_DIR, { recursive: true });
}

/** Deterministic receipts for CI diff (not raw test stdout). */
export function writeContractReceiptCatalog(): void {
  ensureContractArtifactsDir();

  const ruleReceipts: Record<string, string> = {};
  for (const [format, rule] of RULE_ENTRIES) {
    ruleReceipts[format] = receiptForRule(rule);
  }
  writeFileSync(
    join(CONTRACT_ARTIFACTS_DIR, "rule-receipts.json"),
    `${JSON.stringify(ruleReceipts, null, 2)}\n`,
  );

  const startupConfig = startupConfigForLog({
    port: 0,
    dbPath: ":memory:",
    envFixture: "<fixture>",
    secretToken: new Redacted("sk-test-do-not-log-9f3a"),
  });
  const startupInspect = Bun.inspect(startupConfig, { sorted: true });
  writeFileSync(join(CONTRACT_ARTIFACTS_DIR, "startup-config-inspect.txt"), `${startupInspect}\n`);
}

export function writeParityFailureArtifact(result: Extract<CaseResult, { status: "fail" }>): void {
  ensureContractArtifactsDir();
  const safeId = result.caseId.replace(/[^\w.-]+/g, "_");
  writeFileSync(
    join(CONTRACT_ARTIFACTS_DIR, `parity-fail-${safeId}.json`),
    `${JSON.stringify(
      {
        caseId: result.caseId,
        format: result.format,
        receipt: result.receipt,
        diff: result.diff,
      },
      null,
      2,
    )}\n`,
  );
}

export function writeRunFailureSummary(exitCode: number): void {
  ensureContractArtifactsDir();
  writeFileSync(
    join(CONTRACT_ARTIFACTS_DIR, "run-summary.json"),
    `${JSON.stringify({ status: "failed", exitCode }, null, 2)}\n`,
  );
}
