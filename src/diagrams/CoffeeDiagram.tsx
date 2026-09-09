import { Callout, CentreLine, Figure, Hatch, type DiagramProps } from './primitives';

export function CoffeeDiagram(props: DiagramProps) {
  return (
    <Figure {...props} figure="FIG. 4" title="Pressure-staged immersion brewing vessel">
      <CentreLine x1={160} y1={12} x2={160} y2={192} />
      <path d="M116 26 L 204 26 L 204 106 L 116 106 Z" />
      <path d="M116 106 L 204 106 L 192 176 L 128 176 Z" />
      <line x1={116} y1={62} x2={204} y2={62} strokeWidth="0.8" />
      <Hatch x={117} y={63} width={86} height={42} gap={8} />
      <path d="M116 26 q 44 -14 88 0" />
      <path d="M204 44 q 26 6 26 30 q 0 24 -22 30" strokeWidth="0.8" />
      <circle cx={160} cy={106} r={10} strokeWidth="0.8" />
      <path d="M150 106 L 170 106 M160 96 L 160 116" strokeWidth="0.8" />
      <path d="M160 122 l 0 18 m -5 -6 l 5 6 l 5 -6" strokeWidth="0.8" />
      <path d="M140 130 l 0 14 m -4 -5 l 4 5 l 4 -5" strokeWidth="0.8" />
      <path d="M180 130 l 0 14 m -4 -5 l 4 5 l 4 -5" strokeWidth="0.8" />
      <line x1={128} y1={176} x2={192} y2={176} />
      <Callout x={72} y={44} label="1" toX={116} toY={44} />
      <Callout x={262} y={92} label="2" toX={214} toY={98} />
      <Callout x={74} y={158} label="3" toX={130} toY={158} />
    </Figure>
  );
}
