import { Callout, CentreLine, Figure, type DiagramProps } from './primitives';

export function ComputingDiagram(props: DiagramProps) {
  const heads = [58, 78, 98, 118, 138].map((y) => (
    <g key={y}>
      <line x1={252} y1={y} x2={286} y2={y} strokeWidth="0.8" />
      <path d={`M244 ${y - 5} L 252 ${y} L 244 ${y + 5} Z`} strokeWidth="0.8" />
    </g>
  ));
  return (
    <Figure {...props} figure="FIG. 6" title="Rotating magnetic drum storage register">
      <CentreLine x1={40} y1={100} x2={296} y2={100} />
      <ellipse cx={80} cy={100} rx={22} ry={62} />
      <ellipse cx={200} cy={100} rx={22} ry={62} strokeWidth="0.8" strokeDasharray="6 5" />
      <line x1={80} y1={38} x2={200} y2={38} />
      <line x1={80} y1={162} x2={200} y2={162} />
      <ellipse cx={80} cy={100} rx={9} ry={26} strokeWidth="0.8" />
      <line x1={40} y1={100} x2={80} y2={100} />
      <path d="M108 46 q 26 -12 52 0" strokeWidth="0.8" />
      <path d="M154 40 l 8 6 l -9 5" strokeWidth="0.8" />
      <line x1={110} y1={38} x2={110} y2={162} strokeWidth="0.8" />
      <line x1={140} y1={38} x2={140} y2={162} strokeWidth="0.8" />
      <line x1={170} y1={38} x2={170} y2={162} strokeWidth="0.8" />
      <rect x={222} y={44} width={22} height={112} strokeWidth="0.8" />
      {heads}
      <Callout x={56} y={176} label="1" toX={80} toY={150} />
      <Callout x={150} y={182} label="2" toX={150} toY={162} />
      <Callout x={276} y={178} label="3" toX={240} toY={152} />
    </Figure>
  );
}
