import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from '../db.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Fetch user by email
    const rows = await sql`
      SELECT id, email, name, role, active, password_hash,
             photo_url, athlete_id, divisions, permissions, external_ids
      FROM profiles
      WHERE email = ${email.toLowerCase().trim()}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const profile = rows[0];

    if (!profile.active) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, profile.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Sign JWT (expires in 7 days)
    const token = jwt.sign(
      { userId: profile.id, role: profile.role, email: profile.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password_hash) + token
    const { password_hash, ...user } = profile;

    return res.status(200).json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
