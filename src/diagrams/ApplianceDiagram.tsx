import { Callout, CentreLine, Figure, type DiagramProps } from './primitives';

export function ApplianceDiagram(props: DiagramProps) {
  const paddles = [0, 1, 2, 3, 4, 5].map((index) => {
    const angle = (index / 6) * Math.PI * 2 + 0.3;
    return (
      <line
        key={index}
        x1={160 + Math.cos(angle) * 20}
        y1={100 + Math.sin(angle) * 20}
        x2={160 + Math.cos(angle) * 46}
        y2={100 + Math.sin(angle) * 46}
        strokeWidth="0.8"
      />
    );
  });
  return (
    <Figure {...props} figure="FIG. 9" title="Counter-rotating drum laundry agitator">
      <CentreLine x1={160} y1={8} x2={160} y2={192} />
      <CentreLine x1={62} y1={100} x2={258} y2={100} />
      <rect x={44} y={16} width={232} height={168} rx={3} />
      <circle cx={160} cy={100} r={80} />
      <circle cx={160} cy={100} r={70} strokeWidth="0.8" strokeDasharray="7 6" />
      <circle cx={160} cy={100} r={46} />
      <circle cx={160} cy={100} r={20} strokeWidth="0.8" />
      {paddles}
      <path d="M106 44 a 74 74 0 0 1 34 -16" strokeWidth="0.8" />
      <path d="M136 24 l 8 5 l -9 6" strokeWidth="0.8" />
      <path d="M198 68 a 40 40 0 0 0 -30 -12" strokeWidth="0.8" />
      <path d="M172 50 l -8 6 l 9 6" strokeWidth="0.8" />
      <rect x={54} y={26} width={18} height={26} strokeWidth="0.8" />
      <Callout x={70} y={168} label="1" toX={104} toY={144} />
      <Callout x={252} y={168} label="2" toX={196} toY={134} />
      <Callout x={252} y={40} label="3" toX={214} toY={68} />
    </Figure>
  );
}
