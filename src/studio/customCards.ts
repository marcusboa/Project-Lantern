import { diagramRegistry } from '../diagrams';
import type { CurationStatus, DiagramKey, DiagramType, PatentCard } from '../types/patent';

/**
 * Studio cards live in localStorage only — the device has no backend. Swapping this
 * module for a fetch-backed store is the single change needed to persist elsewhere.
 */
const STORAGE_KEY = 'patent-infotainment.studio.cards.v1';

export const CURATION_STATUSES: CurationStatus[] = [
  'Curated',
  'Under Review',
  'Research Required',
  'Draft',
];

export const DIAGRAM_TYPES: DiagramType[] = [
  'mechanism',
  'assembly',
  'cross-section',
  'schematic',
  'exploded',
];

export const DIAGRAM_KEYS = Object.keys(diagramRegistry) as DiagramKey[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function parseCard(value: unknown): PatentCard | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id);
  const displayTitle = asString(value.displayTitle);
  if (id === '' || displayTitle === '') return null;

  const cpcSource = isRecord(value.cpc) ? value.cpc : {};
  const hierarchySource = Array.isArray(cpcSource.hierarchy) ? cpcSource.hierarchy : [];
  const diagramKey = asString(value.diagramComponent) as DiagramKey;
  const diagramType = asString(value.diagramType) as DiagramType;
  const status = asString(value.curationStatus) as CurationStatus;
  const imageSource = isRecord(value.diagramImage) ? value.diagramImage : null;
  const dataUrl = imageSource ? asString(imageSource.dataUrl) : '';

  return {
    id,
    publicationNumber: asString(value.publicationNumber),
    displayTitle,
    publicationDate: asString(value.publicationDate),
    applicant: asString(value.applicant),
    inventor: asString(value.inventor),
    plainLanguageDescription: asString(value.plainLanguageDescription),
    cpc: {
      code: asString(cpcSource.code),
      hierarchy: hierarchySource.flatMap((level) =>
        isRecord(level) ? [{ symbol: asString(level.symbol), title: asString(level.title) }] : [],
      ),
    },
    diagramType: DIAGRAM_TYPES.includes(diagramType) ? diagramType : 'schematic',
    diagramComponent: DIAGRAM_KEYS.includes(diagramKey) ? diagramKey : DIAGRAM_KEYS[0],
    ...(dataUrl.startsWith('data:image/')
      ? { diagramImage: { dataUrl, alt: asString(imageSource?.alt) } }
      : {}),
    sourceReference: asString(value.sourceReference),
    curationStatus: CURATION_STATUSES.includes(status) ? status : 'Draft',
    tags: Array.isArray(value.tags) ? value.tags.filter((tag) => typeof tag === 'string') : [],
    featured: value.featured === true,
  };
}

export function loadCustomCards(): PatentCard[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.flatMap((entry) => parseCard(entry) ?? []) : [];
  } catch {
    return [];
  }
}

export function saveCustomCards(cards: PatentCard[]): { ok: true } | { ok: false; error: string } {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'Browser storage is full — remove a Studio card or use a smaller diagram image.',
    };
  }
}

export function createCardId(): string {
  return `studio-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`;
}
