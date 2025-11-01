import { Pool } from 'pg';
import { randomUUID } from 'crypto';

const connectionString = process.env.DATABASE_URL;

let pool: Pool | null = null;
let usingInMemory = false;

// Simple in-memory store fallback for development when DATABASE_URL is not set or DB connection fails
const usersMap: Map<string, any> = new Map();

if (!connectionString) {
  console.warn('[db] DATABASE_URL not set — falling back to in-memory users store for development');
  usingInMemory = true;
} else {
  try {
    pool = new Pool({ connectionString });
  } catch (e) {
    console.error('[db] Failed to create PG pool — falling back to in-memory store', e);
    usingInMemory = true;
  }
}

export { pool };

// Ensure users table exists (no-op for in-memory)
export async function initDb() {
  if (usingInMemory) return;
  if (!pool) return;
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        google_id text UNIQUE,
        email text UNIQUE,
        name text,
        picture_url text,
        role text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `);
  } finally {
    client.release();
  }
}

export async function findUserByGoogleId(googleId: string) {
  if (usingInMemory) {
    return Array.from(usersMap.values()).find((u) => u.google_id === googleId) || null;
  }
  const res = await pool!.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
  return res.rows[0];
}

export async function upsertUserFromProfile(profile: any, role?: string) {
  const googleId = profile.id;
  const email = profile.emails?.[0]?.value ?? null;
  const name = profile.displayName ?? null;
  const picture = profile.photos?.[0]?.value ?? null;

  if (usingInMemory) {
    let existing = Array.from(usersMap.values()).find((u) => u.google_id === googleId);
    if (existing) {
      existing = { ...existing, email, name, picture_url: picture, updated_at: new Date().toISOString() };
      usersMap.set(existing.id, existing);
      return existing;
    }

    const assignedRole = role ? role.toUpperCase() : 'STUDENT';
    const id = randomUUID();
    const user = {
      id,
      google_id: googleId,
      email,
      name,
      picture_url: picture,
      role: assignedRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    usersMap.set(id, user);
    return user;
  }

  // Persistent DB path
  const existing = await pool!.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
  if (existing.rows.length > 0) {
    const updated = await pool!.query(
      `UPDATE users SET email=$1, name=$2, picture_url=$3, updated_at=now() WHERE google_id=$4 RETURNING *`,
      [email, name, picture, googleId]
    );
    return updated.rows[0];
  }

  const assignedRole = role ? role.toUpperCase() : 'STUDENT';
  const insert = await pool!.query(
    `INSERT INTO users (google_id, email, name, picture_url, role) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [googleId, email, name, picture, assignedRole]
  );
  return insert.rows[0];
}
