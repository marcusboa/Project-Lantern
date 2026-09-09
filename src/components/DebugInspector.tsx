import type { PatentCard } from '../types/patent';

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
      <pre className="inspector__json">{JSON.stringify(card, null, 2)}</pre>
    </section>
  );
}
