import { useState, type CSSProperties } from 'react';
import type { PatentCard } from '../types/patent';
import {
  CPC_RANK_LABELS,
  MAX_CPC_LINES,
  dissectCode,
  rankOf,
  splitInherited,
  titleFor,
  type CpcRank,
} from '../cpc/cpcSymbol';

interface CpcBreakdownProps {
  card: PatentCard;
}

/** Deeper levels stack on one rail so long subgroup chains keep room for their titles. */
const MAX_INDENT = 8;

const MISSING_TITLE = 'Definition not entered';

/** Full-card CPC view: the code split into its parts above the connected hierarchy tree. */
export function CpcBreakdown({ card }: CpcBreakdownProps) {
  const [activeRank, setActiveRank] = useState<CpcRank | null>(null);
  const segments = dissectCode(card.cpc.code);
  const code = card.cpc.code.trim();
  const codeListed = titleFor(card.cpc.hierarchy, code) !== undefined;
  const levels = (
    segments === null || codeListed
      ? card.cpc.hierarchy
      : [...card.cpc.hierarchy, { symbol: code, title: '' }]
  ).slice(0, MAX_CPC_LINES);
  const leaf = levels.at(-1);

  const focus = (rank: CpcRank) => ({
    onMouseEnter: () => setActiveRank(rank),
    onMouseLeave: () => setActiveRank(null),
  });

  return (
    <section
      className={['cpc', activeRank === null ? '' : 'cpc--focus'].filter(Boolean).join(' ')}
      aria-label={`Cooperative Patent Classification ${card.cpc.code}`}
    >
      <div className="cpc__head">
        <span className="label">CPC classification</span>
        <span className="cpc__card-title">{card.displayTitle}</span>
      </div>

      <div className="cpc__band">
        {segments === null ? (
          <span className="cpc__code cpc__code--plain">{card.cpc.code}</span>
        ) : (
          <ol className="cpc__code" aria-label="Code parts">
            {segments.map((segment, position) => (
              <li
                key={segment.rank}
                className={[
                  'cpc__segment',
                  `cpc-rank--${segment.rank}`,
                  activeRank === segment.rank ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ '--order': position } as CSSProperties}
                title={[segment.symbol, titleFor(card.cpc.hierarchy, segment.symbol)]
                  .filter(Boolean)
                  .join(' — ')}
                {...focus(segment.rank)}
              >
                <span className="cpc__segment-text">{segment.text.trim()}</span>
                <span className="cpc__segment-bar" aria-hidden="true" />
                <span className="cpc__segment-label">{CPC_RANK_LABELS[segment.rank]}</span>
              </li>
            ))}
          </ol>
        )}
        {leaf ? (
          <div className="cpc__summary">
            <span className="label">Classified as</span>
            <p className="cpc__summary-title">{leaf.title || MISSING_TITLE}</p>
          </div>
        ) : null}
      </div>

      {levels.length > 0 ? (
        <ol className="cpc__tree" aria-label="Classification hierarchy, broadest first">
          {levels.map((level, depth) => {
            const rank = rankOf(level.symbol);
            const [inherited, added] = splitInherited(level.symbol, levels[depth - 1]?.symbol);
            const indent = Math.min(depth, MAX_INDENT);
            const stacked = depth > MAX_INDENT;
            return (
              <li
                key={`${level.symbol}-${depth}`}
                className={[
                  'cpc__row',
                  `cpc-rank--${rank}`,
                  depth === levels.length - 1 ? 'cpc__row--leaf' : '',
                  stacked ? 'cpc__row--stacked' : '',
                  activeRank === rank ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ '--depth': indent, '--order': depth } as CSSProperties}
                {...focus(rank)}
              >
                {level.symbol !== '' ? (
                  <span className="cpc__node">
                    {inherited !== '' ? (
                      <span className="cpc__node-inherited">{inherited}</span>
                    ) : null}
                    <span className="cpc__node-added">{added}</span>
                  </span>
                ) : null}
                <span className="cpc__rank visually-hidden">{CPC_RANK_LABELS[rank]}: </span>
                {level.title !== '' ? (
                  <span className="cpc__title" title={level.title}>
                    {level.title}
                  </span>
                ) : (
                  <span className="cpc__title cpc__title--missing">{MISSING_TITLE}</span>
                )}
              </li>
            );
          })}
        </ol>
      ) : null}
    </section>
  );
}
