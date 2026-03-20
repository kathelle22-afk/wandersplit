import { createClient } from '@libsql/client';

let _db = null;
function getDb() {
  if (!_db) _db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  return _db;
}

async function initDb() {
  const db = getDb();
  await db.execute(`CREATE TABLE IF NOT EXISTS trips (id TEXT PRIMARY KEY, name TEXT NOT NULL, trip_code TEXT NOT NULL, created_at TEXT NOT NULL)`);
  await db.execute(`CREATE TABLE IF NOT EXISTS members (id TEXT PRIMARY KEY, trip_id TEXT NOT NULL, name TEXT NOT NULL, created_at TEXT NOT NULL)`);
  await db.execute(`CREATE TABLE IF NOT EXISTS expenses (id TEXT PRIMARY KEY, trip_id TEXT NOT NULL, description TEXT NOT NULL, amount REAL NOT NULL, currency TEXT NOT NULL, aud_amount REAL NOT NULL, paid_by TEXT NOT NULL, category TEXT NOT NULL, expense_date TEXT NOT NULL, note TEXT, split_with TEXT NOT NULL, rate_aud_thb REAL, rate_aud_usd REAL, created_at TEXT NOT NULL)`);
}

function uid() { return Math.random().toString(36).slice(2,10) + Date.now().toString(36); }

export default async function handler(req, res) {
  await initDb();
  const db = getDb();

  if (req.method === 'POST') {
    const { action, name, tripCode } = req.body;
    if (action === 'create') {
      if (!name || !tripCode) return res.status(400).json({ error: 'Name and trip code required' });
      if (tripCode.length < 4) return res.status(400).json({ error: 'Trip code must be at least 4 characters' });
      const id = uid(), now = new Date().toISOString();
      await db.execute({ sql: 'INSERT INTO trips (id,name,trip_code,created_at) VALUES (?,?,?,?)', args: [id, name, tripCode, now] });
      return res.status(200).json({ tripId: id, name });
    }
    if (action === 'join') {
      if (!tripCode) return res.status(400).json({ error: 'Trip code required' });
      const r = await db.execute({ sql: 'SELECT id,name FROM trips WHERE trip_code=?', args: [tripCode] });
      if (!r.rows.length) return res.status(404).json({ error: 'Invalid trip code — check with whoever created the trip' });
      return res.status(200).json({ tripId: r.rows[0].id, name: r.rows[0].name });
    }
    return res.status(400).json({ error: 'Unknown action' });
  }

  if (req.method === 'GET') {
    const { tripId } = req.query;
    if (!tripId) return res.status(400).json({ error: 'tripId required' });
    const r = await db.execute({ sql: 'SELECT id,name FROM trips WHERE id=?', args: [tripId] });
    if (!r.rows.length) return res.status(404).json({ error: 'Trip not found' });
    return res.status(200).json(r.rows[0]);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
