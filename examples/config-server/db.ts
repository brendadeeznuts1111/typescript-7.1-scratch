import { Database } from "bun:sqlite";

// users.csv: Zelda first in file so rowid insert order ≠ ORDER BY name (full-chain sort test).
import users from "../../playground/fixtures/users.csv";

export function openDatabase(dbPath: string): Database {
  const path = dbPath.trim() === "" ? ":memory:" : dbPath;
  const db = new Database(path);
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      zip TEXT NOT NULL
    )
  `);
  db.run("DELETE FROM users");
  const insert = db.prepare("INSERT INTO users (name, email, zip) VALUES ($name, $email, $zip)");
  for (const row of users) {
    insert.run({ $name: row.name, $email: row.email, $zip: row.zip });
  }
  return db;
}

export type UserRow = {
  name: string;
  email: string;
  zip: string;
};

/** Shared with contract SQLite arm B — keep in sync with full-chain tests. */
export const LIST_USERS_SQL =
  "SELECT name, email, zip FROM users ORDER BY name ASC, rowid ASC";

export function listUsers(db: Database) {
  return db.query(LIST_USERS_SQL).all() as UserRow[];
}

/**
 * In-memory sort matching LIST_USERS_SQL (name ASC, rowid ASC).
 * Email tiebreak when names collide — CSV/dashboard panels have no rowid column.
 * If LIST_USERS_SQL changes, update this and composition tests deliberately.
 */
export function orderUserRowsLikeListUsersSql(rows: readonly UserRow[]): UserRow[] {
  return [...rows].sort(
    (a, b) => a.name.localeCompare(b.name) || a.email.localeCompare(b.email),
  );
}

/** Same ordering as GET /users at startup (LIST_USERS_SQL on M1 seed). Preload required. */
export function usersServeRowsFromSeed(): UserRow[] {
  const db = openDatabase(":memory:");
  try {
    return listUsers(db);
  } finally {
    db.close();
  }
}

export function insertUser(db: Database, row: UserRow): UserRow {
  db.prepare("INSERT INTO users (name, email, zip) VALUES ($name, $email, $zip)").run({
    $name: row.name,
    $email: row.email,
    $zip: row.zip,
  });
  return row;
}
