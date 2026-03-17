import { neon } from '@neondatabase/serverless';

// Shared Neon SQL client — used by all API routes
// DATABASE_URL must be set as an environment variable
export const sql = neon(process.env.DATABASE_URL);
