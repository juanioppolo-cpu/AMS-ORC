import jwt from 'jsonwebtoken';
import { sql } from '../db.js';

// Middleware: verify JWT token and return the decoded payload
export function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Require valid JWT
  const decoded = verifyToken(req);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const rows = await sql`
      SELECT id, email, name, role, active,
             photo_url, athlete_id, divisions, permissions, external_ids, created_at
      FROM profiles
      ORDER BY role, name
    `;
    return res.status(200).json(rows);
  } catch (err) {
    console.error('GET /api/users error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
