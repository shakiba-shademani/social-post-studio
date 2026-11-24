import { pool } from './pool.ts';

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS drafts (
      sequence BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE,
      id UUID PRIMARY KEY,
      platform_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    )
  `);
  await pool.query('ALTER TABLE drafts ADD COLUMN IF NOT EXISTS image_data BYTEA');
  await pool.query('ALTER TABLE drafts ADD COLUMN IF NOT EXISTS image_type TEXT');
  console.log('Database migrations completed');
} finally {
  await pool.end();
}
