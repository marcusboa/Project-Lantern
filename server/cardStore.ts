import { randomUUID } from 'node:crypto';
import { mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { IMAGE_FILE_PATTERN, IMAGE_ROUTE, parseCard } from '../src/studio/cardSchema';
import type { PatentCard } from '../src/types/patent';

const DATA_URL_PATTERN = /^data:image\/(png|jpeg|gif|webp);base64,([A-Za-z0-9+/=]+)$/;
const EXTENSIONS: Record<string, string> = { png: 'png', jpeg: 'jpg', gif: 'gif', webp: 'webp' };
const IMAGE_FIELDS = ['diagramImage', 'secondaryDiagramImage'] as const;

function imageSources(card: PatentCard | null): string[] {
  return IMAGE_FIELDS.flatMap((field) => card?.[field]?.src ?? []);
}

export interface CardStore {
  imagesDir: string;
  list(): PatentCard[];
  has(id: string): boolean;
  save(card: PatentCard): PatentCard;
  remove(id: string): void;
}

export function resolveDataDir(): string {
  return path.resolve(process.env.LANTERN_DATA_DIR ?? 'data');
}

/**
 * Studio cards live in SQLite (`lantern.db`), one JSON document per card. Uploaded bitmaps are
 * written to `images/` beside it and referenced from the card by URL, so the database stays small.
 */
export function openCardStore(dataDir = resolveDataDir()): CardStore {
  const imagesDir = path.join(dataDir, 'images');
  mkdirSync(imagesDir, { recursive: true });

  const db = new Database(path.join(dataDir, 'lantern.db'));
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      card TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `);

  const selectAll = db.prepare<[], { card: string }>(
    'SELECT card FROM cards ORDER BY created_at, rowid',
  );
  const selectOne = db.prepare<[string], { card: string }>('SELECT card FROM cards WHERE id = ?');
  const upsert = db.prepare<[string, string]>(`
    INSERT INTO cards (id, card) VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET
      card = excluded.card,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  `);
  const deleteOne = db.prepare<[string]>('DELETE FROM cards WHERE id = ?');
  const selectImageUse = db.prepare<[{ src: string }], { id: string }>(
    `SELECT id FROM cards
     WHERE json_extract(card, '$.diagramImage.src') = @src
        OR json_extract(card, '$.secondaryDiagramImage.src') = @src
     LIMIT 1`,
  );

  const read = (row: { card: string } | undefined): PatentCard | null => {
    if (row === undefined) return null;
    try {
      return parseCard(JSON.parse(row.card));
    } catch {
      return null;
    }
  };

  /** Writes inline data URLs to disk and points the card at the URLs the browser should load. */
  const storeImages = (card: PatentCard): PatentCard => {
    let stored = card;
    for (const field of IMAGE_FIELDS) {
      const image = card[field];
      const match = image ? DATA_URL_PATTERN.exec(image.src) : null;
      if (image === undefined || match === null) continue;
      const file = `${card.id.replace(/[^A-Za-z0-9-]/g, '').slice(0, 48) || 'card'}-${randomUUID().slice(0, 8)}.${EXTENSIONS[match[1]]}`;
      writeFileSync(path.join(imagesDir, file), Buffer.from(match[2], 'base64'));
      stored = { ...stored, [field]: { ...image, src: `${IMAGE_ROUTE}${file}` } };
    }
    return stored;
  };

  const discardImages = (previous: PatentCard | null, next: PatentCard | null) => {
    const kept = new Set(imageSources(next));
    for (const src of imageSources(previous)) {
      if (kept.has(src) || !src.startsWith(IMAGE_ROUTE)) continue;
      if (selectImageUse.get({ src }) !== undefined) continue;
      const file = src.slice(IMAGE_ROUTE.length);
      if (!IMAGE_FILE_PATTERN.test(file)) continue;
      try {
        unlinkSync(path.join(imagesDir, file));
      } catch {
        // Already gone; nothing to reclaim.
      }
    }
  };

  return {
    imagesDir,
    list: () => selectAll.all().flatMap((row) => read(row) ?? []),
    has: (id) => selectOne.get(id) !== undefined,
    save: (card) => {
      const previous = read(selectOne.get(card.id));
      const stored = storeImages(card);
      upsert.run(stored.id, JSON.stringify(stored));
      discardImages(previous, stored);
      return stored;
    },
    remove: (id) => {
      const previous = read(selectOne.get(id));
      deleteOne.run(id);
      discardImages(previous, null);
    },
  };
}
