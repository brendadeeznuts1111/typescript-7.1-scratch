import { Database } from "bun:sqlite";

import users from "../../playground/fixtures/users.csv";

export function openDatabase(dbPath: string): Database {
  const db = new Database(dbPath);
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

export function listUsers(db: Database) {
  return db.query("SELECT name, email, zip FROM users ORDER BY name").all() as {
    name: string;
    email: string;
    zip: string;
  }[];
}
