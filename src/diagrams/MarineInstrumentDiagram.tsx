import { Callout, CentreLine, Figure, type DiagramProps } from './primitives';

export function MarineInstrumentDiagram(props: DiagramProps) {
  const ticks = Array.from({ length: 24 }, (_, index) => {
    const angle = (index / 24) * Math.PI * 2;
    const outer = 74;
    const inner = index % 6 === 0 ? 62 : 68;
    return (
      <line
        key={index}
        x1={160 + Math.cos(angle) * outer}
        y1={100 + Math.sin(angle) * outer}
        x2={160 + Math.cos(angle) * inner}
        y2={100 + Math.sin(angle) * inner}
        strokeWidth="0.8"
      />
    );
  });
  return (
    <Figure {...props} figure="FIG. 5" title="Gimbal-compensated depth and bearing indicator">
      <CentreLine x1={160} y1={10} x2={160} y2={190} />
      <CentreLine x1={70} y1={100} x2={250} y2={100} />
      <circle cx={160} cy={100} r={86} />
      <circle cx={160} cy={100} r={78} strokeWidth="0.8" />
      <circle cx={160} cy={100} r={56} />
      <ellipse cx={160} cy={100} rx={86} ry={30} strokeWidth="0.8" strokeDasharray="5 5" />
      {ticks}
      <path d="M160 100 L 200 66" />
      <circle cx={160} cy={100} r={6} strokeWidth="0.8" />
      <path d="M132 128 L 188 128" strokeWidth="0.8" />
      <circle cx={74} cy={100} r={5} strokeWidth="0.8" />
      <circle cx={246} cy={100} r={5} strokeWidth="0.8" />
      <Callout x={44} y={40} label="1" toX={104} toY={62} />
      <Callout x={278} y={40} label="2" toX={214} toY={68} />
      <Callout x={264} y={166} label="3" toX={196} toY={140} />
    </Figure>
  );
}
