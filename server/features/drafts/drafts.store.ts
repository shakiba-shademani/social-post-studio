import { randomUUID } from 'node:crypto';
import { pool } from '../../database/pool.ts';
import type { Draft } from './draft.ts';

interface DraftRow {
  id: string;
  platform_id: Draft['platformId'];
  text: string;
  created_at: Date;
  updated_at: Date;
  has_image: boolean;
}

function toDraft(row: DraftRow): Draft {
  return {
    id: row.id,
    platformId: row.platform_id,
    text: row.text,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    hasImage: row.has_image,
  };
}

export async function addDraft(platformId: Draft['platformId'], text: string, image?: { data: Buffer; type: string } | null): Promise<Draft> {
  const now = new Date().toISOString();
  const draft: Draft = {
    id: randomUUID(),
    platformId,
    text,
    createdAt: now,
    updatedAt: now,
    hasImage: !!image,
  };
  await pool.query(
    'INSERT INTO drafts (id, platform_id, text, created_at, updated_at, image_data, image_type) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [draft.id, draft.platformId, draft.text, draft.createdAt, draft.updatedAt, image?.data ?? null, image?.type ?? null],
  );
  return draft;
}

export async function listDrafts(): Promise<Draft[]> {
  const result = await pool.query<DraftRow>('SELECT id, platform_id, text, created_at, updated_at, image_data IS NOT NULL AS has_image FROM drafts ORDER BY sequence');
  return result.rows.map(toDraft);
}

export async function updateDraft(id: string, platformId: Draft['platformId'], text: string, image?: { data: Buffer; type: string } | null): Promise<Draft | null> {
  const result = await pool.query<DraftRow>(
    'UPDATE drafts SET platform_id = $2, text = $3, updated_at = clock_timestamp(), image_data = CASE WHEN $4 THEN $5 ELSE image_data END, image_type = CASE WHEN $4 THEN $6 ELSE image_type END WHERE id = $1 RETURNING id, platform_id, text, created_at, updated_at, image_data IS NOT NULL AS has_image',
    [id, platformId, text, image !== undefined, image?.data ?? null, image?.type ?? null],
  );
  return result.rows[0] ? toDraft(result.rows[0]) : null;
}

export async function getDraftImage(id: string): Promise<{ data: Buffer; type: string } | null> {
  const result = await pool.query<{ image_data: Buffer | null; image_type: string | null }>('SELECT image_data, image_type FROM drafts WHERE id = $1', [id]);
  const row = result.rows[0];
  return row?.image_data && row.image_type ? { data: row.image_data, type: row.image_type } : null;
}

export async function deleteDraft(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM drafts WHERE id = $1', [id]);
  return result.rowCount === 1;
}
