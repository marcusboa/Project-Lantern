export type CurationStatus =
  | 'Curated'
  | 'Under Review'
  | 'Research Required'
  | 'Draft';

export type DiagramType =
  | 'mechanism'
  | 'assembly'
  | 'cross-section'
  | 'schematic'
  | 'exploded';

export type DiagramKey =
  | 'umbrella'
  | 'pencil'
  | 'bicycle'
  | 'coffee'
  | 'marine'
  | 'computing'
  | 'agriculture'
  | 'audio'
  | 'appliance'
  | 'spacecraft';

/** One rung of a CPC symbol, e.g. { symbol: 'G06N', title: 'Computing arrangements based on specific computational models' }. */
export interface CpcLevel {
  symbol: string;
  title: string;
}

export interface CpcClassification {
  /** Full CPC symbol, e.g. 'G06N 3/006'. */
  code: string;
  /** Section → subclass → group chain, coarsest first; the last entry is `code` itself. */
  hierarchy: CpcLevel[];
}

export interface PatentCard {
  id: string;
  publicationNumber: string;
  displayTitle: string;
  publicationDate: string;
  applicant: string;
  inventor: string;
  plainLanguageDescription: string;
  cpc: CpcClassification;
  diagramType: DiagramType;
  /** Key resolved to a React SVG component in src/diagrams/index.ts */
  diagramComponent: DiagramKey;
  /** Internal-only provenance field. Never rendered in the device card view. */
  sourceReference: string;
  curationStatus: CurationStatus;
  tags: string[];
  featured: boolean;
}
