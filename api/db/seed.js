#!/usr/bin/env node
/**
 * Seed script — populates Neon DB with the AMS mock users
 *
 * Usage:
 *   DATABASE_URL="postgres://..." node api/db/seed.js
 *
 * Or with .env.local loaded:
 *   node --env-file=.env.local api/db/seed.js
 */

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL);

// Permissions builder (mirrors src/app/permissions.js)
const MODULES = [
  'Forms', 'Dashboards', 'Reports', 'ReportsExport',
  'Medical', 'Nutrition', 'PhysicalStrength', 'PhysicalField',
  'ManagerAttendance', 'Wellness',
];

function defaultPermissions(role) {
  const base = Object.fromEntries(MODULES.map(m => [m, { view: false, write: false, delete: false }]));
  if (role === 'Admin') {
    for (const m of MODULES) {
      base[m].view = true;
      base[m].write = m !== 'Dashboards';
      base[m].delete = m !== 'Dashboards';
    }
    base['ReportsExport'].write = false;
    base['ReportsExport'].delete = false;
    return base;
  }
  if (role === 'Coach') {
    base['Dashboards'].view = true;
    base['Reports'].view = true;
    base['ReportsExport'].view = true;
    base['Forms'].view = true;
    base['Forms'].write = true;
    return base;
  }
  // Athlete
  base['Wellness'].view = true;
  base['Wellness'].write = true;
  return base;
}

const USERS = [
  { id: 'u_admin', name: 'Admin ORC', email: 'admin@orc.com', password: '1234', role: 'Admin', divisions: ['M17', 'M19'], active: true },
  { id: 'u_coach_1', name: 'Coach Principal', email: 'coach.principal@orc.com', password: '1234', role: 'Coach', divisions: ['M17', 'M19'], active: true },
  { id: 'u_coach_2', name: 'Coach Asistente', email: 'coach.asistente@orc.com', password: '1234', role: 'Coach', divisions: ['M17'], active: true },
  { id: 'u_ath_001', name: 'Juan Pérez', email: 'juan.perez@orc.com', password: '1234', role: 'Athlete', divisions: ['M17'], active: true, athlete_id: 'a_001', photo_url: 'https://images.unsplash.com/photo-1544365558-35aa4afcf11f?q=80&w=2545&auto=format&fit=crop' },
  { id: 'u_ath_002', name: 'Carlos Gómez', email: 'carlos.gomez@orc.com', password: '1234', role: 'Athlete', divisions: ['M17'], active: true, athlete_id: 'a_002' },
  { id: 'u_ath_003', name: 'Diego Martínez', email: 'diego.martinez@orc.com', password: '1234', role: 'Athlete', divisions: ['M17'], active: true, athlete_id: 'a_003' },
  { id: 'u_ath_004', name: 'Lucas Fernández', email: 'lucas.fernandez@orc.com', password: '1234', role: 'Athlete', divisions: ['M17'], active: true, athlete_id: 'a_004' },
  { id: 'u_ath_005', name: 'Mateo Rodríguez', email: 'mateo.rodriguez@orc.com', password: '1234', role: 'Athlete', divisions: ['M17'], active: true, athlete_id: 'a_005' },
  { id: 'u_ath_006', name: 'Santiago López', email: 'santiago.lopez@orc.com', password: '1234', role: 'Athlete', divisions: ['M17'], active: true, athlete_id: 'a_006' },
  { id: 'u_ath_007', name: 'Tomás García', email: 'tomas.garcia@orc.com', password: '1234', role: 'Athlete', divisions: ['M17'], active: true, athlete_id: 'a_007' },
  { id: 'u_ath_008', name: 'Nicolás Silva', email: 'nicolas.silva@orc.com', password: '1234', role: 'Athlete', divisions: ['M17'], active: true, athlete_id: 'a_008' },
  { id: 'u_ath_009', name: 'Benjamín Torres', email: 'benjamin.torres@orc.com', password: '1234', role: 'Athlete', divisions: ['M17'], active: true, athlete_id: 'a_009' },
  { id: 'u_ath_010', name: 'Agustín Morales', email: 'agustin.morales@orc.com', password: '1234', role: 'Athlete', divisions: ['M17'], active: true, athlete_id: 'a_010' },
  { id: 'u_ath_011', name: 'Felipe Ramírez', email: 'felipe.ramirez@orc.com', password: '1234', role: 'Athlete', divisions: ['M17'], active: true, athlete_id: 'a_011' },
  { id: 'u_ath_012', name: 'Joaquín Castro', email: 'joaquin.castro@orc.com', password: '1234', role: 'Athlete', divisions: ['M17'], active: true, athlete_id: 'a_012' },
  { id: 'u_ath_013', name: 'Sebastián Ruiz', email: 'sebastian.ruiz@orc.com', password: '1234', role: 'Athlete', divisions: ['M19'], active: true, athlete_id: 'a_013' },
  { id: 'u_ath_014', name: 'Martín Díaz', email: 'martin.diaz@orc.com', password: '1234', role: 'Athlete', divisions: ['M19'], active: true, athlete_id: 'a_014' },
  { id: 'u_ath_015', name: 'Emiliano Vega', email: 'emiliano.vega@orc.com', password: '1234', role: 'Athlete', divisions: ['M19'], active: true, athlete_id: 'a_015' },
  { id: 'u_ath_016', name: 'Valentín Herrera', email: 'valentin.herrera@orc.com', password: '1234', role: 'Athlete', divisions: ['M19'], active: true, athlete_id: 'a_016' },
  { id: 'u_ath_017', name: 'Thiago Méndez', email: 'thiago.mendez@orc.com', password: '1234', role: 'Athlete', divisions: ['M19'], active: true, athlete_id: 'a_017' },
  { id: 'u_ath_018', name: 'Lautaro Ortiz', email: 'lautaro.ortiz@orc.com', password: '1234', role: 'Athlete', divisions: ['M19'], active: true, athlete_id: 'a_018' },
];

async function seed() {
  console.log('🌱 Seeding AMS users into Neon...\n');

  let ok = 0;
  let skip = 0;

  for (const u of USERS) {
    const hash = await bcrypt.hash(u.password, 10);
    const perms = defaultPermissions(u.role);

    try {
      await sql`
        INSERT INTO profiles (id, email, name, role, active, password_hash, photo_url, athlete_id, divisions, permissions, external_ids)
        VALUES (
          ${u.id},
          ${u.email},
          ${u.name},
          ${u.role},
          ${u.active},
          ${hash},
          ${u.photo_url ?? null},
          ${u.athlete_id ?? null},
          ${JSON.stringify(u.divisions)}::jsonb,
          ${JSON.stringify(perms)}::jsonb,
          '{}'::jsonb
        )
        ON CONFLICT (id) DO NOTHING
      `;
      console.log(`  ✅ ${u.role.padEnd(7)} — ${u.name} (${u.email})`);
      ok++;
    } catch (err) {
      console.log(`  ⚠️  Skipped ${u.email}: ${err.message}`);
      skip++;
    }
  }

  console.log(`\n✨ Done. Inserted: ${ok}, Skipped: ${skip}`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
