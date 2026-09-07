import { useEffect, useRef, useState, type ReactNode } from 'react';

export const DEVICE_WIDTH = 800;
export const DEVICE_HEIGHT = 480;

interface DeviceFrameProps {
  children: ReactNode;
  /** Hides the outer bezel treatment and preview label. */
  presentation: boolean;
  label?: string;
}

/**
 * Renders a fixed 800 x 480 canvas scaled uniformly to fit its parent,
 * so the device composition is identical at every viewport size.
 */
export function DeviceFrame({ children, presentation, label }: DeviceFrameProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const { width, height } = stage.getBoundingClientRect();
      const padding = presentation ? 0 : 48;
      const next = Math.min(
        (width - padding) / DEVICE_WIDTH,
        (height - padding) / DEVICE_HEIGHT,
      );
      setScale(Math.max(next, 0.25));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [presentation]);

  return (
    <div className="workspace__stage" ref={stageRef}>
      <div
        className={presentation ? 'device' : 'device device--framed'}
        style={{ '--device-scale': scale } as React.CSSProperties}
      >
        {children}
      </div>
      {!presentation && label ? (
        <span
          className="device__bezel-label"
          style={{
            top: `calc(50% + ${(DEVICE_HEIGHT * scale) / 2}px + 12px)`,
            left: `calc(50% - ${(DEVICE_WIDTH * scale) / 2}px)`,
          }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}
