import { describe, expect, test } from "bun:test";

import { FIXTURE_CASES } from "./manifest.ts";
import { RULE_ENTRIES } from "./rules.ts";
import { runParityCase } from "./lib/run-case.ts";

describe("rules manifest", () => {
  test("every fileParity rule has a normalize function", () => {
    for (const [id, rule] of RULE_ENTRIES) {
      expect(typeof rule.normalize).toBe("function");
      expect(rule.format).toBe(id);
    }
  });
});

describe("fixture parity (mapper codegen vs runtime preload)", () => {
  for (const c of FIXTURE_CASES) {
    test(c.id, async () => {
      const result = await runParityCase(c);
      if (result.status === "skip") {
        expect.unreachable(`unexpected skip: ${result.reason}\n${result.receipt ?? ""}`);
      }
      if (result.status === "fail") {
        throw new Error(
          `[${result.caseId}] ${result.receipt}\nmapper: ${result.diff.mapper}\nruntime: ${result.diff.runtime}`,
        );
      }
      expect(result.status).toBe("pass");
      expect(result.receipt.length).toBeGreaterThan(0);
    });
  }
});
