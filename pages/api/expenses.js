import { getDb, initDb } from '../../../lib/db';

function nanoid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export default async function handler(req, res) {
  await initDb();
  const db = getDb();

  // GET - list all expenses for a trip
  if (req.method === 'GET') {
    const { tripId } = req.query;
    if (!tripId) return res.status(400).json({ error: 'tripId required' });
    const result = await db.execute({
      sql: 'SELECT * FROM expenses WHERE trip_id = ? ORDER BY expense_date DESC, created_at DESC',
      args: [tripId],
    });
    const rows = result.rows.map(r => ({
      ...r,
      split_with: JSON.parse(r.split_with),
    }));
    return res.status(200).json(rows);
  }

  // POST - add expense
  if (req.method === 'POST') {
    const {
      tripId, description, amount, currency, audAmount,
      paidBy, category, expenseDate, note, splitWith,
      rateAudThb, rateAudUsd,
    } = req.body;

    if (!tripId || !description || !amount || !currency || !paidBy || !splitWith)
      return res.status(400).json({ error: 'Missing required fields' });

    const id = nanoid();
    await db.execute({
      sql: `INSERT INTO expenses
        (id, trip_id, description, amount, currency, aud_amount, paid_by, category,
         expense_date, note, split_with, rate_aud_thb, rate_aud_usd, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, tripId, description, amount, currency, audAmount,
        paidBy, category, expenseDate || new Date().toISOString().split('T')[0],
        note || '', JSON.stringify(splitWith),
        rateAudThb || null, rateAudUsd || null,
        new Date().toISOString(),
      ],
    });
    return res.status(200).json({ id });
  }

  // DELETE - remove expense
  if (req.method === 'DELETE') {
    const { id, tripId } = req.body;
    if (!id || !tripId) return res.status(400).json({ error: 'id and tripId required' });
    await db.execute({
      sql: 'DELETE FROM expenses WHERE id = ? AND trip_id = ?',
      args: [id, tripId],
    });
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
