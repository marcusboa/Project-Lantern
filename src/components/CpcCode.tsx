import { dissectCode } from '../cpc/cpcSymbol';

interface CpcCodeProps {
  code: string;
  className?: string;
}

/** A CPC symbol with each part tinted by its rank; falls back to plain text when unparseable. */
export function CpcCode({ code, className }: CpcCodeProps) {
  const segments = dissectCode(code);
  return (
    <span className={['cpc-code', className].filter(Boolean).join(' ')}>
      {segments === null
        ? code
        : segments.map((segment) => (
            <span key={segment.rank} className={`cpc-code__part cpc-rank--${segment.rank}`}>
              {segment.text}
            </span>
          ))}
    </span>
  );
}
