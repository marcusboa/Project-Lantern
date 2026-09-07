import { Callout, Figure, Hatch, type DiagramProps } from './primitives';

export function AgricultureDiagram(props: DiagramProps) {
  return (
    <Figure {...props} figure="FIG. 7" title="Row-following seed metering head">
      <line x1={16} y1={168} x2={304} y2={168} />
      <Hatch x={16} y={168} width={288} height={16} gap={12} />
      <circle cx={68} cy={138} r={30} />
      <circle cx={68} cy={138} r={11} strokeWidth="0.8" />
      <path d="M68 108 L 68 168 M38 138 L 98 138 M47 117 L 89 159 M89 117 L 47 159" strokeWidth="0.8" />
      <path d="M68 138 L 150 96" />
      <path d="M150 96 L 232 96" />
      <rect x={182} y={40} width={64} height={56} rx={2} />
      <path d="M182 56 L 246 56" strokeWidth="0.8" />
      <path d="M214 96 L 214 148" />
      <path d="M202 148 L 226 148 L 220 168 L 208 168 Z" />
      <path d="M214 108 l 0 8 M214 122 l 0 8 M214 136 l 0 6" strokeWidth="0.8" />
      <circle cx={150} cy={96} r={8} strokeWidth="0.8" />
      <path d="M140 76 a 26 26 0 0 1 22 -8" strokeDasharray="3 4" strokeWidth="0.8" />
      <Callout x={112} y={178} label="1" toX={92} toY={158} />
      <Callout x={150} y={28} label="2" toX={150} toY={86} />
      <Callout x={278} y={132} label="3" toX={228} toY={128} />
    </Figure>
  );
}
