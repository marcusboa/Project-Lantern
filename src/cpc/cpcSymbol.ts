import type { CpcClassification, CpcLevel } from '../types/patent';

/** Most hierarchy levels a card shows; Studio trims longer chains to this. */
export const MAX_CPC_LINES = 15;

export type CpcRank = 'section' | 'class' | 'subclass' | 'group' | 'subgroup' | 'other';

export const CPC_RANK_LABELS: Record<CpcRank, string> = {
  section: 'Section',
  class: 'Class',
  subclass: 'Subclass',
  group: 'Main group',
  subgroup: 'Subgroup',
  other: 'Level',
};

export interface CpcSegment {
  /** Characters this segment adds to the code, e.g. '63' or '/2209'. */
  text: string;
  rank: CpcRank;
  /** Symbol formed up to and including this segment, e.g. 'B63'. */
  symbol: string;
}

const CODE_PATTERN = /^([A-HY])(?:(\d{2})(?:([A-Z])(?:\s*(\d{1,4})(?:\s*\/\s*(\d{2,6}))?)?)?)?$/;

function normalise(symbol: string): string {
  return symbol.trim().toUpperCase().replace(/\s+/g, '');
}

export function rankOf(symbol: string): CpcRank {
  const compact = normalise(symbol);
  if (/^[A-HY]$/.test(compact)) return 'section';
  if (/^[A-HY]\d{2}$/.test(compact)) return 'class';
  if (/^[A-HY]\d{2}[A-Z]$/.test(compact)) return 'subclass';
  if (/^[A-HY]\d{2}[A-Z]\d{1,4}(\/0+)?$/.test(compact)) return 'group';
  if (/^[A-HY]\d{2}[A-Z]\d{1,4}\/\d+$/.test(compact)) return 'subgroup';
  return 'other';
}

/** Splits a CPC symbol such as 'B63C 11/2209' into its section, class, subclass and group parts. */
export function dissectCode(code: string): CpcSegment[] | null {
  const match = CODE_PATTERN.exec(code.trim().toUpperCase().replace(/\s+/g, ' '));
  if (match === null) return null;
  const [, section, classDigits, subclass, group, subgroup] = match;
  const segments: CpcSegment[] = [{ text: section, rank: 'section', symbol: section }];
  if (classDigits === undefined) return segments;
  const classSymbol = `${section}${classDigits}`;
  segments.push({ text: classDigits, rank: 'class', symbol: classSymbol });
  if (subclass === undefined) return segments;
  const subclassSymbol = `${classSymbol}${subclass}`;
  segments.push({ text: subclass, rank: 'subclass', symbol: subclassSymbol });
  if (group === undefined) return segments;
  const mainGroup = `${subclassSymbol} ${group}/00`;
  if (subgroup === undefined || /^0+$/.test(subgroup)) {
    segments.push({
      text: ` ${group}/${subgroup ?? '00'}`,
      rank: 'group',
      symbol: mainGroup,
    });
    return segments;
  }
  segments.push({ text: ` ${group}`, rank: 'group', symbol: mainGroup });
  segments.push({
    text: `/${subgroup}`,
    rank: 'subgroup',
    symbol: `${subclassSymbol} ${group}/${subgroup}`,
  });
  return segments;
}

/** Title of the hierarchy level whose symbol matches, ignoring spacing and case. */
export function titleFor(hierarchy: CpcLevel[], symbol: string): string | undefined {
  const target = normalise(symbol);
  return hierarchy.find((level) => normalise(level.symbol) === target)?.title;
}

/** Definition of the code's main group (e.g. 'B63C 11/00' for 'B63C 11/2209'), if listed. */
export function mainGroupTitle(cpc: CpcClassification): string | undefined {
  const group = dissectCode(cpc.code)?.find((segment) => segment.rank === 'group');
  return group ? titleFor(cpc.hierarchy, group.symbol) : undefined;
}

/**
 * Splits a level's symbol into the part inherited from its parent and the part it adds,
 * e.g. 'B63C' under 'B63' → ['B63', 'C']; 'B63C 11/22' → ['B63C 11', '/22'].
 */
export function splitInherited(symbol: string, parent: string | undefined): [string, string] {
  const rank = rankOf(symbol);
  if (rank === 'subgroup') {
    const slash = symbol.indexOf('/');
    return [symbol.slice(0, slash), symbol.slice(slash)];
  }
  if (parent !== undefined && parent !== '' && symbol.startsWith(parent) && rank !== 'other') {
    return [parent, symbol.slice(parent.length)];
  }
  return ['', symbol];
}
