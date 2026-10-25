import type { PatentCard } from '../types/patent';
import { countryOf } from '../cards/country';
import { formatDate } from '../cards/formatDate';

interface CardFrontDetailsProps {
  card: PatentCard;
  /** Definition of the CPC main group, shown under the code. */
  definition: string | undefined;
  titleAs?: 'h1' | 'h2';
}

/** Labelled front-of-card text, shared by the device card and the Instagram slide. */
export function CardFrontDetails({
  card,
  definition,
  titleAs: Title = 'h1',
}: CardFrontDetailsProps) {
  const meta = [
    { term: 'Patent number', value: card.publicationNumber },
    { term: 'Country', value: countryOf(card) },
    {
      term: 'Published',
      value: card.publicationDate !== '' ? formatDate(card.publicationDate) : '',
    },
    { term: 'Applicant', value: card.applicant },
    { term: 'Inventor', value: card.inventor },
  ];
  return (
    <>
      <div className="card__field">
        <span className="label">Patent name</span>
        <Title className="card__title">{card.displayTitle}</Title>
      </div>
      <div className="card__field">
        <span className="label">Description</span>
        <p className="card__description">{card.plainLanguageDescription}</p>
      </div>
      {card.cpc.code !== '' ? (
        <div className="card__cpc">
          <span className="label">CPC classification</span>
          <span className="card__cpc-code">{card.cpc.code}</span>
          {definition ? <span className="card__cpc-definition">{definition}</span> : null}
        </div>
      ) : null}
      <dl className="card__meta card__meta--front">
        {meta.map(({ term, value }) => (
          <div key={term}>
            <dt className="label card__meta-term">{term}</dt>
            <dd className="card__meta-value">{value || '—'}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
