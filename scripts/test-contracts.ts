/**
 * Runs contract tests and writes deterministic receipt artifacts (not raw stdout).
 * CI uploads artifacts/contracts/ on failure only.
 */
import {
  writeContractReceiptCatalog,
  writeRunFailureSummary,
} from "../contracts/lib/receipt-artifacts.ts";

writeContractReceiptCatalog();

const proc = Bun.spawn({
  cmd: ["bun", "test", "contracts", "examples/config-server/contracts"],
  cwd: import.meta.dir + "/..",
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
});

const exitCode = await proc.exited;

if (exitCode !== 0) {
  writeRunFailureSummary(exitCode);
}

process.exit(exitCode);
