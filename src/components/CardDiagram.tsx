import type { PatentCard } from '../types/patent';
import { diagramRegistry } from '../diagrams';

/** The card's main diagram, plus its second bitmap side by side or as an inset when set. */
export function CardDiagram({ card }: { card: PatentCard }) {
  const Diagram = diagramRegistry[card.diagramComponent];
  const main = card.diagramImage ? (
    <img
      className="card__diagram card__diagram--bitmap"
      src={card.diagramImage.src}
      alt={card.diagramImage.alt || `Diagram for ${card.displayTitle}`}
    />
  ) : (
    <Diagram className="card__diagram" title={`Diagram for ${card.displayTitle}`} />
  );

  const secondary = card.secondaryDiagramImage;
  const layout = card.diagramLayout ?? 'single';
  if (secondary === undefined || layout === 'single') return main;

  const second = (
    <img
      className="card__diagram card__diagram--bitmap"
      src={secondary.src}
      alt={secondary.alt || `Second diagram for ${card.displayTitle}`}
    />
  );
  return (
    <div className={`card__diagrams card__diagrams--${layout}`}>
      {main}
      {layout === 'inset' ? <div className="card__diagram-inset">{second}</div> : second}
    </div>
  );
}
