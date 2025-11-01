import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

export const pool = new Pool({ connectionString });

// Ensure users table exists
export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
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
  const res = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
  return res.rows[0];
}

export async function upsertUserFromProfile(profile: any, role?: string) {
  const googleId = profile.id;
  const email = profile.emails?.[0]?.value ?? null;
  const name = profile.displayName ?? null;
  const picture = profile.photos?.[0]?.value ?? null;

  // If user exists, keep existing role. If new, set provided role or default to STUDENT
  const existing = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
  if (existing.rows.length > 0) {
    const user = existing.rows[0];
    // Update basic fields
    const updated = await pool.query(
      `UPDATE users SET email=$1, name=$2, picture_url=$3, updated_at=now() WHERE google_id=$4 RETURNING *`,
      [email, name, picture, googleId]
    );
    return updated.rows[0];
  }

  const assignedRole = role ? role.toUpperCase() : 'STUDENT';

  const insert = await pool.query(
    `INSERT INTO users (google_id, email, name, picture_url, role) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [googleId, email, name, picture, assignedRole]
  );
  return insert.rows[0];
}
