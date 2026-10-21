import { join } from "node:path";

import fileConfig from "./config.toml";

const envFixture = join(import.meta.dir, "../../playground/fixtures/sample.env");

export function loadRuntimeConfig() {
  process.loadEnvFile(envFixture);

  const port = Number(process.env.PORT ?? fileConfig.port);
  const dbPath = process.env.DB_PATH ?? fileConfig.dbPath;

  return { port, dbPath, envFixture };
}

export type RuntimeConfig = ReturnType<typeof loadRuntimeConfig>;
