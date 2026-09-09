import type { PatentCard } from '../types/patent';

interface PatentCollectionOverviewProps {
  cards: PatentCard[];
  currentId: string;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export function PatentCollectionOverview({
  cards,
  currentId,
  onSelect,
  onClose,
}: PatentCollectionOverviewProps) {
  return (
    <section className="overview" aria-label="Collection overview">
      <header className="overview__header">
        <span className="label">Collection — {cards.length} Cards</span>
        <button type="button" className="label" onClick={onClose}>
          Close ✕
        </button>
      </header>
      <ul className="overview__list">
        {cards.map((card, index) => (
          <li className="overview__item" key={card.id}>
            <button
              type="button"
              className="overview__button"
              aria-current={card.id === currentId}
              onClick={() => onSelect(index)}
            >
              <span className="overview__index">{String(index + 1).padStart(2, '0')}</span>
              <span className="overview__title">{card.displayTitle}</span>
              <span className="overview__status">{card.curationStatus}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
