import { join } from "node:path";

import fileConfig from "./config.toml";

const envFixture = join(import.meta.dir, "../../playground/fixtures/sample.env");

export function loadRuntimeConfig() {
  process.loadEnvFile(envFixture);

  const port = Number(process.env.PORT ?? fileConfig.port);
  // Default :memory: so parallel app spawns never share an on-disk SQLite file.
  // App parity sets DB_PATH=:memory: explicitly; sample.env does not define DB_PATH.
  const dbPath = process.env.DB_PATH ?? fileConfig.dbPath ?? ":memory:";

  return { port, dbPath, envFixture };
}

export type RuntimeConfig = ReturnType<typeof loadRuntimeConfig>;
