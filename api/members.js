import { createClient } from '@libsql/client';

let _db = null;
function getDb() {
  if (!_db) _db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  return _db;
}

function uid() { return Math.random().toString(36).slice(2,10) + Date.now().toString(36); }

export default async function handler(req, res) {
  const db = getDb();

  if (req.method === 'GET') {
    const { tripId } = req.query;
    if (!tripId) return res.status(400).json({ error: 'tripId required' });
    const r = await db.execute({ sql: 'SELECT id,name FROM members WHERE trip_id=? ORDER BY created_at ASC', args: [tripId] });
    return res.status(200).json(r.rows);
  }

  if (req.method === 'POST') {
    const { tripId, name } = req.body;
    if (!tripId || !name) return res.status(400).json({ error: 'tripId and name required' });
    const id = uid();
    await db.execute({ sql: 'INSERT INTO members (id,trip_id,name,created_at) VALUES (?,?,?,?)', args: [id, tripId, name, new Date().toISOString()] });
    return res.status(200).json({ id, name });
  }

  if (req.method === 'DELETE') {
    const { id, tripId } = req.body;
    if (!id || !tripId) return res.status(400).json({ error: 'id and tripId required' });
    await db.execute({ sql: 'DELETE FROM members WHERE id=? AND trip_id=?', args: [id, tripId] });
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
