import type { BitmapDiagram, PatentCard } from '../types/patent';

function shorten(image: BitmapDiagram | undefined): BitmapDiagram | undefined {
  if (image === undefined || image.src.length <= 120) return image;
  return { ...image, src: `${image.src.slice(0, 48)}… (${image.src.length} chars)` };
}

interface DebugInspectorProps {
  card: PatentCard;
}

/** Development-only view of fields hidden from the device card, including sourceReference. */
export function DebugInspector({ card }: DebugInspectorProps) {
  return (
    <section className="inspector" aria-label="Debug inspector">
      <div className="inspector__summary">
        <span>Inspector — {card.id}</span>
        <span className="inspector__source">sourceReference: {card.sourceReference}</span>
        <span>featured: {String(card.featured)}</span>
      </div>
      <pre className="inspector__json">
        {JSON.stringify(
          { ...card, diagramImage: shorten(card.diagramImage), secondaryDiagramImage: shorten(card.secondaryDiagramImage) },
          null,
          2,
        )}
      </pre>
    </section>
  );
}
