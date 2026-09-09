import type { ReactNode } from 'react';

export interface DiagramProps {
  className?: string;
  title?: string;
}

interface FigureProps extends DiagramProps {
  children: ReactNode;
  /** Figure label rendered in the corner, e.g. "FIG. 1" */
  figure?: string;
}

export const VIEW_WIDTH = 320;
export const VIEW_HEIGHT = 200;

export function Figure({ children, className, title, figure = 'FIG. 1' }: FigureProps) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={title ?? 'Simplified patent diagram'}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g className="diagram__ink">{children}</g>
      <text
        className="diagram__figure-label"
        x={VIEW_WIDTH - 2}
        y={VIEW_HEIGHT - 4}
        textAnchor="end"
        stroke="none"
      >
        {figure}
      </text>
    </svg>
  );
}

interface CalloutProps {
  x: number;
  y: number;
  label: string;
  /** End point of the leader line drawn from the callout circle. */
  toX: number;
  toY: number;
}

export function Callout({ x, y, label, toX, toY }: CalloutProps) {
  return (
    <g className="diagram__callout">
      <line x1={x} y1={y} x2={toX} y2={toY} strokeWidth="0.8" />
      <circle cx={x} cy={y} r={7.5} strokeWidth="0.8" />
      <text className="diagram__callout-label" x={x} y={y + 2.6} textAnchor="middle" stroke="none">
        {label}
      </text>
    </g>
  );
}

interface CentreLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function CentreLine({ x1, y1, x2, y2 }: CentreLineProps) {
  return (
    <line
      className="diagram__centreline"
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      strokeWidth="0.8"
      strokeDasharray="10 3 2 3"
    />
  );
}

interface HatchProps {
  x: number;
  y: number;
  width: number;
  height: number;
  gap?: number;
}

/** Diagonal section hatching within a rectangular region. */
export function Hatch({ x, y, width, height, gap = 6 }: HatchProps) {
  const lines = [];
  for (let offset = -height; offset < width; offset += gap) {
    const x1 = x + Math.max(offset, 0);
    const y1 = y + Math.max(-offset, 0);
    const x2 = x + Math.min(offset + height, width);
    const y2 = y + Math.min(height, width - offset);
    lines.push(<line key={offset} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="0.8" />);
  }
  return <g className="diagram__hatch">{lines}</g>;
}
