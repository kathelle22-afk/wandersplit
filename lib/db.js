import { createClient } from '@libsql/client';

let _client = null;

export function getDb() {
  if (!_client) {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables');
    }
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

export async function initDb() {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      trip_code TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (trip_id) REFERENCES trips(id)
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      aud_amount REAL NOT NULL,
      paid_by TEXT NOT NULL,
      category TEXT NOT NULL,
      expense_date TEXT NOT NULL,
      note TEXT,
      split_with TEXT NOT NULL,
      rate_aud_thb REAL,
      rate_aud_usd REAL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (trip_id) REFERENCES trips(id)
    )
  `);
}
