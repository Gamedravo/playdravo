import { memo, type ReactNode } from 'react';
import { useInViewport } from '../hooks/useInViewport';

interface LazyShelfProps {
  children: ReactNode;
  /** Render immediately (above-the-fold shelves). */
  eager?: boolean;
  minHeight?: number;
  className?: string;
}

function ShelfPlaceholder({ minHeight }: { minHeight: number }) {
  return (
    <div
      className="shelf-section shelf-lazy-placeholder"
      style={{ minHeight }}
      aria-hidden
    >
      <div className="h-7 w-40 rounded-lg bg-white/[0.04] mb-3" />
      <div className="flex gap-2.5 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-[calc((100%-2.5rem)/3.5)] max-w-[140px] aspect-[4/5] rounded-xl bg-white/[0.03]"
          />
        ))}
      </div>
    </div>
  );
}

/** Defers shelf DOM + images until near viewport. */
export const LazyShelf = memo(function LazyShelf({
  children,
  eager = false,
  minHeight = 260,
  className = '',
}: LazyShelfProps) {
  const [ref, inView] = useInViewport<HTMLDivElement>({
    rootMargin: '500px 0px',
    once: true,
  });
  const show = eager || inView;

  return (
    <div ref={ref} className={className}>
      {show ? children : <ShelfPlaceholder minHeight={minHeight} />}
    </div>
  );
});
