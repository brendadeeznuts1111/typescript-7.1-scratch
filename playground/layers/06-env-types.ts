/**
 * Type-only layer: `.env` side-effect import for `process.env` typings.
 * Kept out of the runtime graph — motherload's generated `.env` module passes a `URL` to
 * `process.loadEnvFile`, which Bun rejects today.
 */
import "../fixtures/sample.env";

import { type Equal, expect } from "../lib/assert.ts";

expect<Equal<typeof process.env.DATABASE_URL, string>>();
expect<Equal<typeof process.env.GREETING, string>>();
