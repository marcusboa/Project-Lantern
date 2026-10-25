import type { PatentCard } from '../types/patent';

const OFFICE_COUNTRIES: Record<string, string> = {
  AU: 'Australia',
  CA: 'Canada',
  CH: 'Switzerland',
  CN: 'China',
  DE: 'Germany',
  EP: 'Europe (EPO)',
  FR: 'France',
  GB: 'United Kingdom',
  IT: 'Italy',
  JP: 'Japan',
  KR: 'South Korea',
  NZ: 'New Zealand',
  US: 'United States',
  WO: 'International (PCT)',
};

/** The card's country of application, falling back to the publication number's office prefix. */
export function countryOf(card: PatentCard): string {
  if (card.country.trim() !== '') return card.country;
  const prefix = /^\s*([A-Za-z]{2})/.exec(card.publicationNumber)?.[1]?.toUpperCase();
  return (prefix && OFFICE_COUNTRIES[prefix]) || '';
}
