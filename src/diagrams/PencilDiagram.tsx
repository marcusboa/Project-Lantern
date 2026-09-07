import { Callout, CentreLine, Figure, Hatch, type DiagramProps } from './primitives';

export function PencilDiagram(props: DiagramProps) {
  return (
    <Figure {...props} figure="FIG. 2" title="Self-indexing lead advance mechanism">
      <CentreLine x1={20} y1={100} x2={300} y2={100} />
      <path d="M40 78 L 232 78 L 262 92 L 282 100 L 262 108 L 232 122 L 40 122 Z" />
      <line x1={232} y1={78} x2={232} y2={122} strokeWidth="0.8" />
      <line x1={92} y1={78} x2={92} y2={122} strokeWidth="0.8" />
      <line x1={152} y1={78} x2={152} y2={122} strokeWidth="0.8" />
      <Hatch x={41} y={79} width={50} height={42} gap={7} />
      <rect x={100} y={90} width={44} height={20} rx={2} strokeWidth="0.8" />
      <path d="M144 100 L 232 100" strokeWidth="0.8" />
      <path d="M160 88 l 10 12 l -10 12 M176 88 l 10 12 l -10 12 M192 88 l 10 12 l -10 12" strokeWidth="0.8" />
      <path d="M262 92 L 300 100 L 262 108" strokeWidth="0.8" />
      <path d="M40 84 q -14 16 0 32" />
      <Callout x={70} y={158} label="1" toX={66} toY={124} />
      <Callout x={122} y={52} label="2" toX={122} toY={88} />
      <Callout x={196} y={158} label="3" toX={186} toY={124} />
      <Callout x={286} y={62} label="4" toX={272} toY={92} />
    </Figure>
  );
}
