import { describe, expect, test } from "bun:test";

import { RULE_ENTRIES, receiptForRule, type NormalizeRule } from "./rules.ts";

/**
 * Receipt = deterministic one-line string from receiptForRule(rule):
 * either "<format> · no documented exception — …" or "<format> · exception (applies): <reason>".
 * Used in parity pass/fail output; must not embed runtime paths, env, or timestamps.
 */

const ABS_PATH =
  /(^|[\s"'])(\/Users\/|\/home\/|\/root\/|\/var\/|\/tmp\/)/;
const ISO_TIMESTAMP = /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
/** Runtime env access (not static prose like "values from process.env" in exception copy). */
const PROCESS_ENV_ACCESS = /\bprocess\.env(?:\.[A-Za-z_]\w*|\[)/;
const POINTER_HEX = /\b0x[0-9a-fA-F]{8,}\b/;

function assertReceiptScrubbed(receipt: string, format: string): void {
  expect(receipt, `${format} absolute path`).not.toMatch(ABS_PATH);
  expect(receipt, `${format} ISO timestamp`).not.toMatch(ISO_TIMESTAMP);
  expect(receipt, `${format} process.env access`).not.toMatch(PROCESS_ENV_ACCESS);
  expect(receipt, `${format} pointer hex`).not.toMatch(POINTER_HEX);
}

function assertExceptionReasonStatic(rule: NormalizeRule): void {
  if (!rule.exception) return;
  const reason = rule.exception.reason;
  expect(reason.length).toBeGreaterThan(0);
  assertReceiptScrubbed(reason, `${rule.format} exception.reason`);
  expect(reason).toBe(rule.exception.reason);
}

describe("receipts (determinism + scrubbing)", () => {
  for (const [format, rule] of RULE_ENTRIES) {
    test(`${format} receipt is deterministic and scrubbed`, () => {
      const first = receiptForRule(rule);
      const second = receiptForRule(rule);
      expect(second).toBe(first);

      assertReceiptScrubbed(first, format);
      assertExceptionReasonStatic(rule);
    });
  }
});
