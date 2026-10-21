import { describe, expect, test } from "bun:test";

import { FIXTURE_CASES } from "./manifest.ts";
import { runParityCase } from "./lib/run-case.ts";

describe("fixture parity (mapper codegen vs runtime preload)", () => {
  for (const c of FIXTURE_CASES) {
    test(c.id, async () => {
      const result = await runParityCase(c);
      if (result.status === "skip") {
        expect.unreachable(`unexpected skip: ${result.reason}`);
      }
      if (result.status === "fail") {
        expect(result.diff.mapper).toBe(result.diff.runtime);
      }
      expect(result.status).toBe("pass");
    });
  }
});
