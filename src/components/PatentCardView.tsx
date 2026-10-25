import type { PatentCard } from '../types/patent';
import { diagramRegistry } from '../diagrams';
import { CpcBreakdown } from './CpcBreakdown';
import { mainGroupTitle as findMainGroupTitle } from '../cpc/cpcSymbol';
import { CardFrontDetails } from './CardFrontDetails';
import { useFitScale } from '../hooks/useFitScale';

export type TransitionPhase = 'enter' | 'exit';

interface PatentCardViewProps {
  card: PatentCard;
  position: number;
  total: number;
  phase: TransitionPhase;
  /** Navigation direction; drives which side the card enters from. */
  reverse?: boolean;
  /** Shows the back face: full CPC hierarchy and bibliographic details. */
  flipped: boolean;
  onFlip: () => void;
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

export function PatentCardView({
  card,
  position,
  total,
  phase,
  reverse,
  flipped,
  onFlip,
}: PatentCardViewProps) {
  const Diagram = diagramRegistry[card.diagramComponent];
  const hasCpc = card.cpc.code !== '' || card.cpc.hierarchy.length > 0;
  const showBack = flipped && hasCpc;
  const mainGroupTitle = findMainGroupTitle(card.cpc);
  const frontText = useFitScale<HTMLDivElement>(
    [
      card.displayTitle,
      card.publicationNumber,
      card.country,
      card.plainLanguageDescription,
      card.cpc.code,
      mainGroupTitle,
      card.applicant,
      card.inventor,
      card.publicationDate,
    ].join('|'),
    0.6,
    1.3,
  );
  const backText = useFitScale<HTMLDivElement>(
    JSON.stringify([card.displayTitle, card.cpc]),
    0.6,
    1.3,
  );
  const className = [
    'card',
    phase === 'enter' ? 'card--enter' : 'card--exit',
    reverse ? 'card--reverse' : '',
    showBack ? 'card--flipped' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const header = (
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
  );

  const footer = (side: 'front' | 'back') => (
    <footer className="card__footer">
      <div className="card__footer-group">
        <span className="card__sequence">
          {formatSequence(position)} / {formatSequence(total)}
        </span>
        <span className="card__hint">← → Browse collection</span>
        {hasCpc ? (
          <button
            type="button"
            className="card__flip"
            aria-pressed={showBack}
            tabIndex={phase === 'exit' ? -1 : undefined}
            onClick={onFlip}
          >
            <span className="card__flip-key">C</span>
            {side === 'front' ? 'Flip · CPC hierarchy' : 'Flip · Front'}
          </button>
        ) : null}
      </div>
    </footer>
  );

  return (
    <article
      className={className}
      aria-hidden={phase === 'exit'}
      aria-label={`Patent card ${position} of ${total}: ${card.displayTitle}`}
    >
      <div className="card__flipper">
        <div className="card__face card__face--front" inert={showBack}>
          {header}
          <div className="card__body">
            <div className="card__text" ref={frontText}>
              <CardFrontDetails card={card} definition={mainGroupTitle} />
            </div>

            <figure className="card__figure">
              {card.diagramImage ? (
                <img
                  className="card__diagram card__diagram--bitmap"
                  src={card.diagramImage.src}
                  alt={card.diagramImage.alt || `Diagram for ${card.displayTitle}`}
                />
              ) : (
                <Diagram className="card__diagram" title={`Diagram for ${card.displayTitle}`} />
              )}
            </figure>
          </div>
          {footer('front')}
        </div>

        {hasCpc ? (
          <div className="card__face card__face--back" inert={!showBack}>
            {header}
            <div className="card__back">
              <div className="card__back-cpc" ref={backText}>
                <CpcBreakdown card={card} />
              </div>
              {card.tags.length > 0 ? (
                <div className="card__tags card__tags--back">
                  {card.tags.map((tag) => (
                    <span className="card__tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            {footer('back')}
          </div>
        ) : null}
      </div>
    </article>
  );
}
