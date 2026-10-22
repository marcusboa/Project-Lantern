import { useLayoutEffect, useRef } from 'react';

const SEARCH_STEPS = 7;

/**
 * Sets `--fit` on the referenced element to the largest scale in [min, max] at which its
 * content fits without overflowing; font sizes inside multiply by `var(--fit)`.
 */
export function useFitScale<T extends HTMLElement>(contentKey: string, min: number, max: number) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (element === null) return;

    const fitsAt = (scale: number) => {
      element.style.setProperty('--fit', scale.toFixed(3));
      return (
        element.scrollHeight <= element.clientHeight + 1 &&
        element.scrollWidth <= element.clientWidth + 1
      );
    };

    const fit = () => {
      if (fitsAt(max)) return;
      let low = min;
      let high = max;
      for (let step = 0; step < SEARCH_STEPS; step += 1) {
        const middle = (low + high) / 2;
        if (fitsAt(middle)) low = middle;
        else high = middle;
      }
      fitsAt(low);
    };

    fit();
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) fit();
    });
    return () => {
      cancelled = true;
    };
  }, [contentKey, min, max]);

  return ref;
}
