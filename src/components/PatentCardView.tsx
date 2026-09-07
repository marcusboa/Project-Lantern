import type { PatentCard } from '../types/patent';
import { diagramRegistry } from '../diagrams';

export type TransitionPhase = 'enter' | 'exit';

interface PatentCardViewProps {
  card: PatentCard;
  position: number;
  total: number;
  phase: TransitionPhase;
  /** Navigation direction; drives which side the card enters from. */
  reverse?: boolean;
}

const statusModifier: Record<PatentCard['curationStatus'], string> = {
  Curated: 'card__status--curated',
  'Under Review': 'card__status--review',
  'Research Required': 'card__status--research',
  Draft: 'card__status--draft',
};

function formatSequence(value: number): string {
  return String(value).padStart(2, '0');
}

function formatDate(isoLike: string): string {
  const [year, month, day] = isoLike.split('-');
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ];
  const monthIndex = Number(month) - 1;
  const monthLabel = months[monthIndex] ?? month;
  return `${day} ${monthLabel} ${year}`;
}

export function PatentCardView({ card, position, total, phase, reverse }: PatentCardViewProps) {
  const Diagram = diagramRegistry[card.diagramComponent];
  const className = [
    'card',
    phase === 'enter' ? 'card--enter' : 'card--exit',
    reverse ? 'card--reverse' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={className}
      aria-hidden={phase === 'exit'}
      aria-label={`Patent card ${position} of ${total}: ${card.displayTitle}`}
    >
      <header className="card__header">
        <div className="card__eyebrow">
          <span className="label">Patent Card</span>
          <span className="card__publication">{card.publicationNumber}</span>
        </div>
        <span className={`card__status ${statusModifier[card.curationStatus]}`}>
          <span className="card__status-mark" aria-hidden="true" />
          {card.curationStatus}
        </span>
      </header>

      <div className="card__body">
        <div className="card__text">
          <h1 className="card__title">{card.displayTitle}</h1>
          <span className="card__date">
            {formatDate(card.publicationDate)}
            <span aria-hidden="true"> · </span>
            {card.diagramType.replace('-', ' ').toUpperCase()}
          </span>
          <p className="card__description">{card.plainLanguageDescription}</p>
          <dl className="card__meta">
            <div>
              <dt className="label card__meta-term">Applicant</dt>
              <dd className="card__meta-value">{card.applicant}</dd>
            </div>
            <div>
              <dt className="label card__meta-term">Inventor</dt>
              <dd className="card__meta-value">{card.inventor}</dd>
            </div>
            <div className="card__tags">
              {card.tags.map((tag) => (
                <span className="card__tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </dl>
        </div>

        <figure className="card__figure">
          <Diagram className="card__diagram" title={`Diagram for ${card.displayTitle}`} />
        </figure>
      </div>

      <footer className="card__footer">
        <div className="card__footer-group">
          <span className="card__sequence">
            {formatSequence(position)} / {formatSequence(total)}
          </span>
          <span className="card__hint">← → Browse collection</span>
        </div>
      </footer>
    </article>
  );
}
