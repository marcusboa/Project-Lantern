import type { ComponentType } from 'react';
import type { DiagramKey } from '../types/patent';
import type { DiagramProps } from './primitives';
import { UmbrellaDiagram } from './UmbrellaDiagram';
import { PencilDiagram } from './PencilDiagram';
import { BicycleDiagram } from './BicycleDiagram';
import { CoffeeDiagram } from './CoffeeDiagram';
import { MarineInstrumentDiagram } from './MarineInstrumentDiagram';
import { ComputingDiagram } from './ComputingDiagram';
import { AgricultureDiagram } from './AgricultureDiagram';
import { AudioDiagram } from './AudioDiagram';
import { ApplianceDiagram } from './ApplianceDiagram';
import { SpacecraftDiagram } from './SpacecraftDiagram';

/** Maps a card's diagramComponent key to its SVG component. */
export const diagramRegistry: Record<DiagramKey, ComponentType<DiagramProps>> = {
  umbrella: UmbrellaDiagram,
  pencil: PencilDiagram,
  bicycle: BicycleDiagram,
  coffee: CoffeeDiagram,
  marine: MarineInstrumentDiagram,
  computing: ComputingDiagram,
  agriculture: AgricultureDiagram,
  audio: AudioDiagram,
  appliance: ApplianceDiagram,
  spacecraft: SpacecraftDiagram,
};

export type { DiagramProps };
