import bcrypt from 'bcryptjs';
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const decoded = verifyToken(req);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });
  if (decoded.role !== 'Admin') return res.status(403).json({ error: 'Admin access required' });

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id, name, email, role, password = 'password123', divisions, permissions, external_ids, active, photo_url, athlete_id } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: 'name, email, and role are required' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const userId = id || ('u_' + crypto.randomUUID().slice(0, 8));

    const rows = await sql`
      INSERT INTO profiles (id, email, name, role, active, password_hash, photo_url, athlete_id, divisions, permissions, external_ids)
      VALUES (
        ${userId},
        ${email.toLowerCase().trim()},
        ${name},
        ${role},
        ${active ?? true},
        ${password_hash},
        ${photo_url ?? null},
        ${athlete_id ?? null},
        ${JSON.stringify(divisions ?? [])}::jsonb,
        ${JSON.stringify(permissions ?? {})}::jsonb,
        ${JSON.stringify(external_ids ?? {})}::jsonb
      )
      RETURNING id, email, name, role, active, photo_url, athlete_id, divisions, permissions, external_ids, created_at
    `;

    return res.status(201).json(rows[0]);
  } catch (err) {
    if (err.message?.includes('unique')) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error('POST /api/users/create error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
