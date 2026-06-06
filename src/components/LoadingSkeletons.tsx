import { memo } from 'react';

interface SkeletonProps {
  isDarkMode?: boolean;
  className?: string;
}

function skeletonSurface(isDarkMode: boolean, className = '') {
  return `${isDarkMode ? 'bg-white/[0.04] border-white/5' : 'bg-black/[0.04] border-black/5'} border ${className}`;
}

export const ShimmerBlock = memo(function ShimmerBlock({
  isDarkMode = true,
  className = '',
}: SkeletonProps) {
  return (
    <div className={`relative overflow-hidden ${skeletonSurface(isDarkMode, className)}`}>
      <div className="absolute inset-0 shimmer-overlay opacity-40" aria-hidden />
    </div>
  );
});

export const GameCardSkeleton = memo(function GameCardSkeleton({
  isDarkMode = true,
  className = 'aspect-[4/5] rounded-xl md:rounded-2xl',
}: SkeletonProps) {
  return <ShimmerBlock isDarkMode={isDarkMode} className={className} />;
});

export const GameCardGridSkeleton = memo(function GameCardGridSkeleton({
  isDarkMode = true,
  count = 12,
}: SkeletonProps & { count?: number }) {
  return (
    <div className="game-card-grid">
      {Array.from({ length: count }, (_, i) => (
        <GameCardSkeleton key={`card-skeleton-${i}`} isDarkMode={isDarkMode} />
      ))}
    </div>
  );
});

export const ShelfSkeleton = memo(function ShelfSkeleton({
  isDarkMode = true,
  cardCount = 8,
}: SkeletonProps & { cardCount?: number }) {
  return (
    <section className="shelf-section">
      <div className="shelf-header">
        <div className="section-heading-stack">
          <ShimmerBlock isDarkMode={isDarkMode} className="h-3 w-24 rounded-md" />
          <ShimmerBlock isDarkMode={isDarkMode} className="h-6 w-40 rounded-lg" />
        </div>
      </div>
      <div className="shelf-scroll">
        {Array.from({ length: cardCount }, (_, i) => (
          <div key={`shelf-skeleton-${i}`} className="shelf-card">
            <GameCardSkeleton isDarkMode={isDarkMode} className="aspect-[4/5] rounded-xl w-full" />
          </div>
        ))}
      </div>
    </section>
  );
});

export const HomePageSkeleton = memo(function HomePageSkeleton({
  isDarkMode = true,
}: SkeletonProps) {
  return (
    <div className="homepage-stack animate-in fade-in duration-200">
      <ShimmerBlock
        isDarkMode={isDarkMode}
        className="h-[180px] md:h-[220px] rounded-2xl md:rounded-3xl w-full"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <ShimmerBlock key={`chip-skeleton-${i}`} isDarkMode={isDarkMode} className="h-10 rounded-xl" />
        ))}
      </div>
      <ShelfSkeleton isDarkMode={isDarkMode} />
      <ShelfSkeleton isDarkMode={isDarkMode} cardCount={10} />
      <ShelfSkeleton isDarkMode={isDarkMode} cardCount={6} />
    </div>
  );
});

export const GamePageSkeleton = memo(function GamePageSkeleton({
  isDarkMode = true,
}: SkeletonProps) {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 space-y-6 animate-in fade-in duration-200">
      <ShimmerBlock isDarkMode={isDarkMode} className="h-4 w-32 rounded-md" />
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="flex-1 space-y-4">
          <ShimmerBlock
            isDarkMode={isDarkMode}
            className="aspect-[4/3] md:aspect-video rounded-[1.5rem] lg:rounded-[2.5rem] w-full"
          />
          <ShimmerBlock isDarkMode={isDarkMode} className="h-20 rounded-2xl w-full" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {Array.from({ length: 5 }, (_, i) => (
              <GameCardSkeleton key={`related-skeleton-${i}`} isDarkMode={isDarkMode} />
            ))}
          </div>
        </div>
        <ShimmerBlock
          isDarkMode={isDarkMode}
          className="w-full lg:w-80 h-80 lg:h-96 rounded-[1.5rem] shrink-0"
        />
      </div>
    </div>
  );
});

export const SimplePageSkeleton = memo(function SimplePageSkeleton({
  isDarkMode = true,
}: SkeletonProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4 animate-in fade-in duration-200">
      <ShimmerBlock isDarkMode={isDarkMode} className="h-8 w-2/3 rounded-lg" />
      <ShimmerBlock isDarkMode={isDarkMode} className="h-4 w-full rounded-md" />
      <ShimmerBlock isDarkMode={isDarkMode} className="h-4 w-5/6 rounded-md" />
      <ShimmerBlock isDarkMode={isDarkMode} className="h-4 w-4/6 rounded-md" />
      <ShimmerBlock isDarkMode={isDarkMode} className="h-48 w-full rounded-2xl mt-4" />
    </div>
  );
});

export const RouteContentSkeleton = memo(function RouteContentSkeleton({
  pathname,
  isDarkMode = true,
}: SkeletonProps & { pathname: string }) {
  const inner = (() => {
    if (pathname === '/') {
      return <HomePageSkeleton isDarkMode={isDarkMode} />;
    }
    if (pathname.startsWith('/games/')) {
      return <GamePageSkeleton isDarkMode={isDarkMode} />;
    }
    if (pathname.startsWith('/search')) {
      return (
        <div className="p-4 space-y-4">
          <ShimmerBlock isDarkMode={isDarkMode} className="h-12 w-full max-w-xl rounded-2xl mx-auto" />
          <GameCardGridSkeleton isDarkMode={isDarkMode} count={14} />
        </div>
      );
    }
    if (pathname.startsWith('/library') || pathname.startsWith('/category/')) {
      return (
        <div className="p-2 md:p-4">
          <GameCardGridSkeleton isDarkMode={isDarkMode} count={14} />
        </div>
      );
    }
    return <SimplePageSkeleton isDarkMode={isDarkMode} />;
  })();

  return (
    <div className={`min-h-[60vh] ${isDarkMode ? 'bg-bg-dark' : 'bg-white'}`}>{inner}</div>
  );
});
