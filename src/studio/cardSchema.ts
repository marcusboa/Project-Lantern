import type { CurationStatus, DiagramKey, DiagramType, PatentCard } from '../types/patent';

/**
 * Validation shared by the browser and the card server. Kept free of React and DOM imports so
 * the server can load it directly.
 */

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

const DIAGRAM_KEY_SET: Record<DiagramKey, true> = {
  umbrella: true,
  pencil: true,
  bicycle: true,
  coffee: true,
  marine: true,
  computing: true,
  agriculture: true,
  audio: true,
  appliance: true,
  spacecraft: true,
};

export const DIAGRAM_KEYS = Object.keys(DIAGRAM_KEY_SET) as DiagramKey[];

/** Path prefix under which the card server publishes stored diagram files. */
export const IMAGE_ROUTE = '/api/images/';
export const IMAGE_FILE_PATTERN = /^[A-Za-z0-9-]+\.(png|jpg|gif|webp)$/;
export const CARD_ID_PATTERN = /^[A-Za-z0-9_-]{1,80}$/;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

/** A diagram source is either a freshly uploaded data URL or a file already stored on the server. */
export function isDiagramSource(src: string): boolean {
  return (
    src.startsWith('data:image/') ||
    (src.startsWith(IMAGE_ROUTE) && IMAGE_FILE_PATTERN.test(src.slice(IMAGE_ROUTE.length)))
  );
}

/** Coerces untrusted input into a PatentCard, or returns null when it has no id or title. */
export function parseCard(value: unknown): PatentCard | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id);
  const displayTitle = asString(value.displayTitle).trim();
  if (!CARD_ID_PATTERN.test(id) || displayTitle === '') return null;

  const cpcSource = isRecord(value.cpc) ? value.cpc : {};
  const hierarchySource = Array.isArray(cpcSource.hierarchy) ? cpcSource.hierarchy : [];
  const diagramKey = asString(value.diagramComponent) as DiagramKey;
  const diagramType = asString(value.diagramType) as DiagramType;
  const status = asString(value.curationStatus) as CurationStatus;
  const imageSource = isRecord(value.diagramImage) ? value.diagramImage : null;
  const src = imageSource ? asString(imageSource.src) : '';

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
    ...(isDiagramSource(src) ? { diagramImage: { src, alt: asString(imageSource?.alt) } } : {}),
    sourceReference: asString(value.sourceReference),
    curationStatus: CURATION_STATUSES.includes(status) ? status : 'Draft',
    tags: Array.isArray(value.tags) ? value.tags.filter((tag) => typeof tag === 'string') : [],
    featured: value.featured === true,
  };
}
