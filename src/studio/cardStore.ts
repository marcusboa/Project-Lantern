import type { PatentCard } from '../types/patent';
import { isRecord, parseCard } from './cardSchema';

const CARDS_ENDPOINT = '/api/cards';
/** Where earlier Studio builds kept cards; imported into the server once, then cleared. */
const LEGACY_STORAGE_KEY = 'patent-infotainment.studio.cards.v1';

export type SaveResult = { ok: true; card: PatentCard } | { ok: false; error: string };

class CardServerError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function errorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Something went wrong talking to the card server.';
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(path, init);
  } catch {
    throw new Error('The card server is not reachable — start the app with `npm run dev` or `npm start`.');
  }
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new CardServerError(
      isRecord(body) && typeof body.error === 'string'
        ? body.error
        : `The card server responded with ${response.status}.`,
      response.status,
    );
  }
  return response.status === 204 ? null : response.json();
}

export async function fetchCards(): Promise<PatentCard[]> {
  const body = await request(CARDS_ENDPOINT);
  return Array.isArray(body) ? body.flatMap((entry) => parseCard(entry) ?? []) : [];
}

/** With `createOnly`, the server refuses (412) to replace a card that already exists. */
export async function putCard(card: PatentCard, createOnly = false): Promise<PatentCard> {
  const body = await request(`${CARDS_ENDPOINT}/${encodeURIComponent(card.id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(createOnly ? { 'If-None-Match': '*' } : {}),
    },
    body: JSON.stringify(card),
  });
  const saved = parseCard(body);
  if (saved === null) throw new Error('The card server returned an unreadable card.');
  return saved;
}

export async function removeCard(id: string): Promise<void> {
  await request(`${CARDS_ENDPOINT}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

/** Earlier builds stored bitmaps as `diagramImage.dataUrl`; the model now calls it `src`. */
function upgradeLegacyCard(entry: unknown): unknown {
  if (!isRecord(entry) || !isRecord(entry.diagramImage)) return entry;
  const { dataUrl, ...image } = entry.diagramImage;
  return { ...entry, diagramImage: { src: dataUrl, ...image } };
}

/**
 * Moves cards saved in this browser by earlier Studio builds onto the server. Cards the server
 * already holds are left alone, since the server copy may have been edited since.
 */
export async function importLegacyCards(): Promise<void> {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
  } catch {
    return;
  }
  if (raw === null) return;
  let entries: unknown;
  try {
    entries = JSON.parse(raw);
  } catch {
    entries = [];
  }
  const cards = Array.isArray(entries)
    ? entries.flatMap((entry) => parseCard(upgradeLegacyCard(entry)) ?? [])
    : [];
  for (const card of cards) {
    try {
      await putCard(card, true);
    } catch (cause) {
      if (!(cause instanceof CardServerError && cause.status === 412)) throw cause;
    }
  }
  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Storage became unavailable; the next load skips cards the server already has.
  }
}

export function createCardId(): string {
  return `studio-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`;
}
