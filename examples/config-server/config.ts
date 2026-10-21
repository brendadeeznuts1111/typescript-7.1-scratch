import { join } from "node:path";

import fileConfig from "./config.toml";
import { Redacted } from "./redacted.ts";

const envFixture = join(import.meta.dir, "../../playground/fixtures/sample.env");

export function loadRuntimeConfig() {
  process.loadEnvFile(envFixture);

  // Read mutable env after loadEnvFile via process.env — not Bun.env (launch-time snapshot).
  const port = Number(process.env.PORT ?? fileConfig.port);
  // Default :memory: so parallel app spawns never share an on-disk SQLite file.
  // App parity sets DB_PATH=:memory: explicitly; sample.env does not define DB_PATH.
  const dbPath = process.env.DB_PATH ?? fileConfig.dbPath ?? ":memory:";

  const secretRaw = process.env.SECRET_TOKEN;
  const secretToken = secretRaw ? new Redacted(secretRaw) : undefined;

  return { port, dbPath, envFixture, secretToken };
}

export type RuntimeConfig = ReturnType<typeof loadRuntimeConfig>;

/** Deterministic startup snapshot for logs (sorted inspect keys). */
export function startupConfigForLog(config: RuntimeConfig) {
  return {
    port: config.port,
    dbPath: config.dbPath,
    ...(config.secretToken ? { secretToken: config.secretToken } : {}),
  };
}
