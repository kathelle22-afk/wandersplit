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
    const r = await db.execute({ sql: 'SELECT * FROM expenses WHERE trip_id=? ORDER BY expense_date DESC, created_at DESC', args: [tripId] });
    return res.status(200).json(r.rows);
  }

  if (req.method === 'POST') {
    const { tripId, description, amount, currency, audAmount, paidBy, category, expenseDate, note, splitWith, rateAudThb, rateAudUsd } = req.body;
    if (!tripId || !description || !amount || !currency || !paidBy || !splitWith) return res.status(400).json({ error: 'Missing required fields' });
    const id = uid();
    await db.execute({
      sql: 'INSERT INTO expenses (id,trip_id,description,amount,currency,aud_amount,paid_by,category,expense_date,note,split_with,rate_aud_thb,rate_aud_usd,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      args: [id, tripId, description, amount, currency, audAmount, paidBy, category, expenseDate || new Date().toISOString().split('T')[0], note || '', JSON.stringify(splitWith), rateAudThb || null, rateAudUsd || null, new Date().toISOString()]
    });
    return res.status(200).json({ id });
  }

  if (req.method === 'DELETE') {
    const { id, tripId } = req.body;
    if (!id || !tripId) return res.status(400).json({ error: 'id and tripId required' });
    await db.execute({ sql: 'DELETE FROM expenses WHERE id=? AND trip_id=?', args: [id, tripId] });
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
