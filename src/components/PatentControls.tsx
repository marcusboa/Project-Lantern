interface PatentControlsProps {
  position: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  titles: string[];
}

export function PatentControls({
  position,
  total,
  onPrevious,
  onNext,
  onSelect,
  titles,
}: PatentControlsProps) {
  return (
    <nav className="controls" aria-label="Patent card navigation">
      <div className="controls__ticks">
        {titles.map((title, index) => (
          <button
            key={title}
            type="button"
            className="controls__tick"
            aria-current={index + 1 === position}
            aria-label={`Go to card ${index + 1}: ${title}`}
            onClick={() => onSelect(index)}
          />
        ))}
      </div>
      <span className="visually-hidden" aria-live="polite">
        Card {position} of {total}
      </span>
      <button
        type="button"
        className="controls__button"
        onClick={onPrevious}
        aria-label="Previous patent card"
      >
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
          <path d="M7.5 1.5 L 3 6 L 7.5 10.5" />
        </svg>
      </button>
      <button
        type="button"
        className="controls__button"
        onClick={onNext}
        aria-label="Next patent card"
      >
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
          <path d="M4.5 1.5 L 9 6 L 4.5 10.5" />
        </svg>
      </button>
    </nav>
  );
}
