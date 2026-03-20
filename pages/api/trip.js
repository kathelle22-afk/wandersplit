import { getDb, initDb } from '../../../lib/db';

function nanoid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export default async function handler(req, res) {
  await initDb();
  const db = getDb();

  // POST /api/trip - create or authenticate a trip
  if (req.method === 'POST') {
    const { action, name, tripCode } = req.body;

    if (action === 'create') {
      if (!name || !tripCode) return res.status(400).json({ error: 'Name and trip code required' });
      if (tripCode.length < 4) return res.status(400).json({ error: 'Trip code must be at least 4 characters' });

      const id = nanoid();
      const now = new Date().toISOString();
      await db.execute({
        sql: 'INSERT INTO trips (id, name, trip_code, created_at) VALUES (?, ?, ?, ?)',
        args: [id, name, tripCode, now],
      });
      // Add default members
      const defaults = ['Alice', 'Ben', 'Chloe', 'Dan'];
      for (const m of defaults) {
        await db.execute({
          sql: 'INSERT INTO members (id, trip_id, name, created_at) VALUES (?, ?, ?, ?)',
          args: [nanoid(), id, m, now],
        });
      }
      return res.status(200).json({ tripId: id, name });
    }

    if (action === 'join') {
      if (!tripCode) return res.status(400).json({ error: 'Trip code required' });
      const result = await db.execute({
        sql: 'SELECT id, name FROM trips WHERE trip_code = ?',
        args: [tripCode],
      });
      if (!result.rows.length) return res.status(404).json({ error: 'Invalid trip code' });
      const trip = result.rows[0];
      return res.status(200).json({ tripId: trip.id, name: trip.name });
    }

    return res.status(400).json({ error: 'Unknown action' });
  }

  // GET /api/trip?tripId=xxx - get trip info
  if (req.method === 'GET') {
    const { tripId } = req.query;
    if (!tripId) return res.status(400).json({ error: 'tripId required' });
    const result = await db.execute({
      sql: 'SELECT id, name FROM trips WHERE id = ?',
      args: [tripId],
    });
    if (!result.rows.length) return res.status(404).json({ error: 'Trip not found' });
    return res.status(200).json(result.rows[0]);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
