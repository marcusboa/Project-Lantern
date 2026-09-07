import { Callout, CentreLine, Figure, Hatch, type DiagramProps } from './primitives';

export function AudioDiagram(props: DiagramProps) {
  return (
    <Figure {...props} figure="FIG. 8" title="Dual-chamber personal acoustic transducer">
      <CentreLine x1={30} y1={100} x2={300} y2={100} />
      <path d="M96 34 L 240 34 L 240 166 L 96 166 Z" />
      <path d="M96 46 L 96 154" strokeWidth="0.8" />
      <path d="M96 100 L 62 74 L 62 126 Z" />
      <path d="M62 100 L 30 100" strokeWidth="0.8" />
      <line x1={168} y1={34} x2={168} y2={166} />
      <Hatch x={169} y={35} width={70} height={130} gap={11} />
      <path d="M120 66 L 156 84 L 156 116 L 120 134" />
      <ellipse cx={120} cy={100} rx={8} ry={34} strokeWidth="0.8" />
      <circle cx={156} cy={100} r={12} strokeWidth="0.8" />
      <path d="M240 62 q 22 8 22 38 q 0 30 -22 38" strokeWidth="0.8" />
      <circle cx={204} cy={54} r={5} strokeWidth="0.8" />
      <path d="M44 82 q -12 18 0 36 M32 70 q -18 30 0 60" strokeWidth="0.8" />
      <Callout x={92} y={184} label="1" toX={110} toY={140} />
      <Callout x={196} y={184} label="2" toX={196} toY={166} />
      <Callout x={284} y={44} label="3" toX={246} toY={62} />
    </Figure>
  );
}
