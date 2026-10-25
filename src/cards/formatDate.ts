const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** '1949-10-18' → '18 OCT 1949'; anything else is returned unchanged. */
export function formatDate(isoLike: string): string {
  const [year, month, day] = isoLike.split('-');
  if (day === undefined) return isoLike;
  const monthLabel = MONTHS[Number(month) - 1] ?? month;
  return `${day} ${monthLabel} ${year}`;
}
