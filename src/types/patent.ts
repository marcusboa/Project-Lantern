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

export interface PatentCard {
  id: string;
  publicationNumber: string;
  displayTitle: string;
  publicationDate: string;
  applicant: string;
  inventor: string;
  plainLanguageDescription: string;
  diagramType: DiagramType;
  /** Key resolved to a React SVG component in src/diagrams/index.ts */
  diagramComponent: DiagramKey;
  /** Internal-only provenance field. Never rendered in the device card view. */
  sourceReference: string;
  curationStatus: CurationStatus;
  tags: string[];
  featured: boolean;
}
