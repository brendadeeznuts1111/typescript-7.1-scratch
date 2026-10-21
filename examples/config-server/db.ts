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

export function insertUser(db: Database, row: UserRow): UserRow {
  db.prepare("INSERT INTO users (name, email, zip) VALUES ($name, $email, $zip)").run({
    $name: row.name,
    $email: row.email,
    $zip: row.zip,
  });
  return row;
}
