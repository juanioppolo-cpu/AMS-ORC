import jwt from 'jsonwebtoken';
import { sql } from '../db.js';

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
  } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const decoded = verifyToken(req);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });
  if (decoded.role !== 'Admin') return res.status(403).json({ error: 'Admin access required' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'User ID required' });

  // PUT — update user
  if (req.method === 'PUT') {
    const { name, email, role, active, photo_url, athlete_id, divisions, permissions, external_ids } = req.body;

    try {
      const rows = await sql`
        UPDATE profiles SET
          name = COALESCE(${name}, name),
          email = COALESCE(${email?.toLowerCase().trim()}, email),
          role = COALESCE(${role}, role),
          active = COALESCE(${active}, active),
          photo_url = COALESCE(${photo_url}, photo_url),
          athlete_id = COALESCE(${athlete_id}, athlete_id),
          divisions = COALESCE(${JSON.stringify(divisions ?? null)}::jsonb, divisions),
          permissions = COALESCE(${JSON.stringify(permissions ?? null)}::jsonb, permissions),
          external_ids = COALESCE(${JSON.stringify(external_ids ?? null)}::jsonb, external_ids)
        WHERE id = ${id}
        RETURNING id, email, name, role, active, photo_url, athlete_id, divisions, permissions, external_ids
      `;

      if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json(rows[0]);
    } catch (err) {
      console.error('PUT /api/users/[id] error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // DELETE — remove user
  if (req.method === 'DELETE') {
    // Prevent deleting yourself
    if (decoded.userId === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    try {
      await sql`DELETE FROM profiles WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('DELETE /api/users/[id] error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
