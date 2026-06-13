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
      {/* Title bar skeleton */}
      <div className="shelf-header">
        <div className="section-heading-stack">
          <div className="h-2.5 w-20 rounded-md bg-white/[0.05] animate-pulse" />
          <div className="h-5 w-36 rounded-lg bg-white/[0.06] animate-pulse" />
        </div>
      </div>
      {/* Card row skeletons */}
      <div className="flex gap-2.5 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-[calc((100%-3.5rem)/4.5)] max-w-[140px] aspect-[3/4] rounded-xl bg-white/[0.04] animate-pulse"
            style={{ animationDelay: `${i * 60}ms` }}
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
    rootMargin: '900px 0px',
    once: true,
  });
  const show = eager || inView;

  return (
    <div ref={ref} className={className}>
      {show ? children : <ShelfPlaceholder minHeight={minHeight} />}
    </div>
  );
});
