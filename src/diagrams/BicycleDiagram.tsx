import { Callout, Figure, type DiagramProps } from './primitives';

export function BicycleDiagram(props: DiagramProps) {
  return (
    <Figure {...props} figure="FIG. 3" title="Compound hinge for folding bicycle frames">
      <circle cx={70} cy={144} r={34} />
      <circle cx={250} cy={144} r={34} />
      <circle cx={70} cy={144} r={4} strokeWidth="0.8" />
      <circle cx={250} cy={144} r={4} strokeWidth="0.8" />
      <path d="M70 144 L 150 144 L 250 144" />
      <path d="M150 144 L 178 70 L 108 70 Z" />
      <path d="M108 70 L 70 144" />
      <path d="M178 70 L 250 144" />
      <path d="M108 70 L 92 46 L 68 46" />
      <path d="M178 70 L 186 52 L 172 46" />
      <circle cx={150} cy={144} r={12} strokeWidth="0.8" />
      <circle cx={150} cy={144} r={5} strokeWidth="0.8" />
      <circle cx={143} cy={107} r={9} strokeWidth="0.8" />
      <path d="M143 107 l 26 -12" strokeDasharray="4 4" strokeWidth="0.8" />
      <path d="M158 92 a 22 22 0 0 1 12 10" strokeDasharray="3 4" strokeWidth="0.8" />
      <Callout x={112} y={182} label="1" toX={144} toY={156} />
      <Callout x={106} y={26} label="2" toX={136} toY={100} />
      <Callout x={286} y={82} label="3" toX={244} toY={116} />
    </Figure>
  );
}
