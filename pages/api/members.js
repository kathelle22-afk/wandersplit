import { getDb, initDb } from '../../../lib/db';

function nanoid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export default async function handler(req, res) {
  await initDb();
  const db = getDb();

  // GET - list members for a trip
  if (req.method === 'GET') {
    const { tripId } = req.query;
    if (!tripId) return res.status(400).json({ error: 'tripId required' });
    const result = await db.execute({
      sql: 'SELECT id, name FROM members WHERE trip_id = ? ORDER BY created_at ASC',
      args: [tripId],
    });
    return res.status(200).json(result.rows);
  }

  // POST - add member
  if (req.method === 'POST') {
    const { tripId, name } = req.body;
    if (!tripId || !name) return res.status(400).json({ error: 'tripId and name required' });
    const id = nanoid();
    await db.execute({
      sql: 'INSERT INTO members (id, trip_id, name, created_at) VALUES (?, ?, ?, ?)',
      args: [id, tripId, name, new Date().toISOString()],
    });
    return res.status(200).json({ id, name });
  }

  // DELETE - remove member
  if (req.method === 'DELETE') {
    const { id, tripId } = req.body;
    if (!id || !tripId) return res.status(400).json({ error: 'id and tripId required' });
    await db.execute({
      sql: 'DELETE FROM members WHERE id = ? AND trip_id = ?',
      args: [id, tripId],
    });
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
