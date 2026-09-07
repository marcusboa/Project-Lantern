import { Callout, CentreLine, Figure, type DiagramProps } from './primitives';

export function UmbrellaDiagram(props: DiagramProps) {
  return (
    <Figure {...props} figure="FIG. 1" title="Umbrella canopy tensioning assembly">
      <CentreLine x1={160} y1={16} x2={160} y2={192} />
      <path d="M46 104 C 78 44, 242 44, 274 104" />
      <path d="M46 104 q 19 14 38 0 q 19 14 38 0 q 19 14 38 0 q 19 14 38 0 q 19 14 38 0" />
      <path d="M160 50 L 46 104 M160 50 L 103 104 M160 50 L 160 104 M160 50 L 217 104 M160 50 L 274 104" />
      <line x1={160} y1={40} x2={160} y2={50} />
      <line x1={160} y1={50} x2={160} y2={176} />
      <path d="M160 176 q 0 14 -14 14" />
      <circle cx={160} cy={118} r={9} strokeWidth="0.8" />
      <path d="M160 109 L 112 88 M160 109 L 208 88 M160 127 L 132 100 M160 127 L 188 100" strokeWidth="0.8" />
      <Callout x={62} y={150} label="1" toX={112} toY={92} />
      <Callout x={252} y={152} label="2" toX={200} toY={116} />
      <Callout x={264} y={72} label="3" toX={244} toY={88} />
    </Figure>
  );
}
