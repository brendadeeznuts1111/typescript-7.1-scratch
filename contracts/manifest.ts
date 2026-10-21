import type { ImportKind } from "./rules.ts";

export type FixtureCase = {
  id: string;
  /** Repo-relative path */
  path: string;
  importKind: ImportKind;
};

/** M1: CSV + TOML first parity win; expand as normalizers are proven. */
export const FIXTURE_CASES: FixtureCase[] = [
  {
    id: "fixtures/users.csv",
    path: "playground/fixtures/users.csv",
    importKind: "default",
  },
  {
    id: "fixtures/scores.tsv",
    path: "playground/fixtures/scores.tsv",
    importKind: "default",
  },
  {
    id: "fixtures/config.toml",
    path: "playground/fixtures/config.toml",
    importKind: "default",
  },
];
