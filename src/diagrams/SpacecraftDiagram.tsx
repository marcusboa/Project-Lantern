import { Callout, CentreLine, Figure, type DiagramProps } from './primitives';

export function SpacecraftDiagram(props: DiagramProps) {
  const ribs = [-52, -26, 0, 26, 52].map((offset) => (
    <path key={offset} d={`M160 100 L ${160 + offset * 1.9} ${100 - 74 + Math.abs(offset) * 0.34}`} />
  ));
  return (
    <Figure {...props} figure="FIG. 10" title="Deployable satellite reflector rib latch">
      <CentreLine x1={160} y1={8} x2={160} y2={192} />
      <path d="M62 62 q 98 -58 196 0" />
      <path d="M62 62 q 98 44 196 0" strokeWidth="0.8" strokeDasharray="6 5" />
      {ribs}
      <rect x={140} y={100} width={40} height={54} rx={2} />
      <line x1={140} y1={116} x2={180} y2={116} strokeWidth="0.8" />
      <path d="M140 128 L 108 148 M180 128 L 212 148" strokeWidth="0.8" />
      <path d="M96 140 L 120 156 L 108 168 L 84 152 Z" strokeWidth="0.8" />
      <path d="M224 140 L 200 156 L 212 168 L 236 152 Z" strokeWidth="0.8" />
      <circle cx={160} cy={100} r={9} />
      <circle cx={160} cy={100} r={3} strokeWidth="0.8" />
      <path d="M186 78 a 34 34 0 0 1 12 16" strokeDasharray="3 4" strokeWidth="0.8" />
      <Callout x={44} y={112} label="1" toX={78} toY={74} />
      <Callout x={276} y={104} label="2" toX={240} toY={78} />
      <Callout x={160} y={182} label="3" toX={160} toY={158} />
    </Figure>
  );
}
