import { useCallback, useEffect, useMemo, useState } from 'react';
import { DeviceFrame, DEVICE_HEIGHT, DEVICE_WIDTH } from './components/DeviceFrame';
import { PatentCardView } from './components/PatentCardView';
import { PatentControls } from './components/PatentControls';
import { PatentCollectionOverview } from './components/PatentCollectionOverview';
import { DebugInspector } from './components/DebugInspector';
import { patentCards } from './data/patentCards';
import type { CurationStatus, PatentCard } from './types/patent';

const AUTO_ADVANCE_MS = 18000;
const TRANSITION_MS = 640;

const STATUS_FILTERS: Array<CurationStatus | 'All'> = [
  'All',
  'Curated',
  'Under Review',
  'Research Required',
  'Draft',
];

interface Outgoing {
  card: PatentCard;
  position: number;
  key: number;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function App() {
  const [statusFilter, setStatusFilter] = useState<CurationStatus | 'All'>('All');
  const [index, setIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [outgoing, setOutgoing] = useState<Outgoing | null>(null);
  const [presentation, setPresentation] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);

  const cards = useMemo(
    () =>
      statusFilter === 'All'
        ? patentCards
        : patentCards.filter((card) => card.curationStatus === statusFilter),
    [statusFilter],
  );

  const safeIndex = cards.length > 0 ? Math.min(index, cards.length - 1) : 0;
  const current = cards[safeIndex];

  const goTo = useCallback(
    (nextIndex: number, options?: { reverse?: boolean; auto?: boolean }) => {
      if (cards.length === 0) return;
      const wrapped = (nextIndex + cards.length) % cards.length;
      if (wrapped === safeIndex) return;
      const nextKey = transitionKey + 1;
      setTransitionKey(nextKey);
      setReverse(options?.reverse ?? false);
      if (!prefersReducedMotion()) {
        setOutgoing({ card: cards[safeIndex], position: safeIndex + 1, key: nextKey });
      }
      setIndex(wrapped);
      if (!options?.auto) setAutoAdvance(false);
    },
    [cards, safeIndex, transitionKey],
  );

  const next = useCallback(
    (auto = false) => goTo(safeIndex + 1, { auto }),
    [goTo, safeIndex],
  );
  const previous = useCallback(
    () => goTo(safeIndex - 1, { reverse: true }),
    [goTo, safeIndex],
  );
  const shuffle = useCallback(() => {
    if (cards.length < 2) return;
    let candidate = safeIndex;
    while (candidate === safeIndex) {
      candidate = Math.floor(Math.random() * cards.length);
    }
    goTo(candidate);
  }, [cards.length, goTo, safeIndex]);

  useEffect(() => {
    if (!outgoing) return;
    const timer = window.setTimeout(() => setOutgoing(null), TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [outgoing]);

  useEffect(() => {
    if (!autoAdvance) return;
    const timer = window.setInterval(() => next(true), AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [autoAdvance, next]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        next();
      } else if (event.key === 'ArrowLeft') {
        previous();
      } else if (event.key === 'f' || event.key === 'F') {
        setPresentation((value) => !value);
      } else if (event.key === 'Escape') {
        if (overviewOpen) setOverviewOpen(false);
        else setPresentation(false);
      } else if (event.key === 'o' || event.key === 'O') {
        setOverviewOpen((value) => !value);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [next, previous, overviewOpen]);

  return (
    <main className={presentation ? 'workspace workspace--presentation' : 'workspace'}>
      {!presentation ? (
        <div className="workspace__bar">
          <div className="workspace__bar-group">
            <span>Patent Infotainment Device</span>
            <span>
              Device Preview — {DEVICE_WIDTH} × {DEVICE_HEIGHT}
            </span>
          </div>
          <div className="workspace__bar-group">
            <label className="workspace__bar-group">
              <span>Status</span>
              <select
                className="chrome-select"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as CurationStatus | 'All');
                  setIndex(0);
                }}
              >
                {STATUS_FILTERS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="chrome-button"
              onClick={() => setOverviewOpen((value) => !value)}
              aria-pressed={overviewOpen}
            >
              Collection
            </button>
            <button type="button" className="chrome-button" onClick={shuffle}>
              Shuffle
            </button>
            <button
              type="button"
              className="chrome-button"
              onClick={() => setAutoAdvance((value) => !value)}
              aria-pressed={autoAdvance}
            >
              Auto-advance
            </button>
            <button
              type="button"
              className="chrome-button"
              onClick={() => setInspectorOpen((value) => !value)}
              aria-pressed={inspectorOpen}
            >
              Inspector
            </button>
            <button
              type="button"
              className="chrome-button"
              onClick={() => setPresentation(true)}
            >
              Presentation (F)
            </button>
          </div>
        </div>
      ) : null}

      <DeviceFrame
        presentation={presentation}
        label={`Device Preview — ${DEVICE_WIDTH} × ${DEVICE_HEIGHT}`}
      >
        {outgoing ? (
          <PatentCardView
            key={`out-${outgoing.key}`}
            card={outgoing.card}
            position={outgoing.position}
            total={cards.length}
            phase="exit"
          />
        ) : null}
        {current ? (
          <PatentCardView
            key={`${current.id}-${transitionKey}`}
            card={current}
            position={safeIndex + 1}
            total={cards.length}
            phase="enter"
            reverse={reverse}
          />
        ) : null}
        {current ? (
          <PatentControls
            position={safeIndex + 1}
            total={cards.length}
            titles={cards.map((card) => card.displayTitle)}
            onPrevious={previous}
            onNext={() => next()}
            onSelect={(target) => goTo(target, { reverse: target < safeIndex })}
          />
        ) : null}
        {overviewOpen && current ? (
          <PatentCollectionOverview
            cards={cards}
            currentId={current.id}
            onSelect={(target) => {
              goTo(target, { reverse: target < safeIndex });
              setOverviewOpen(false);
            }}
            onClose={() => setOverviewOpen(false)}
          />
        ) : null}
      </DeviceFrame>

      {!presentation && inspectorOpen && current ? <DebugInspector card={current} /> : null}
    </main>
  );
}
