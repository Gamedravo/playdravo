import type { ReactNode } from 'react';
import { Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { RouteContentSkeleton } from '../components/LoadingSkeletons';
import { hasVisitedRoute, markRouteVisited } from '../lib/routeVisitCache';

interface LazyRouteProps {
  children: ReactNode;
  pathname: string;
  isDarkMode: boolean;
}

/** Revisited routes: instant bg-only fallback — no skeleton flash on back navigation. */
export function LazyRoute({ children, pathname, isDarkMode }: LazyRouteProps) {
  const isRevisit = hasVisitedRoute(pathname);
  const bg = isDarkMode ? 'bg-bg-dark' : 'bg-white';
  const contentRef = useRef<HTMLDivElement>(null);

  // Mark visited on first paint to prevent flicker on back navigation
  useLayoutEffect(() => {
    markRouteVisited(pathname);
  }, [pathname]);

  // Prevent layout shift by keeping a stable container height during transition
  useLayoutEffect(() => {
    if (contentRef.current && isRevisit) {
      contentRef.current.style.minHeight = '100%';
    }
  }, [isRevisit]);

  return (
    <Suspense
      fallback={
        isRevisit ? (
          <div className={`min-h-screen ${bg}`} aria-hidden />
        ) : (
          <div className={`min-h-[32vh] ${bg}`}>
            <RouteContentSkeleton pathname={pathname} isDarkMode={isDarkMode} />
          </div>
        )
      }
    >
      <div ref={contentRef} className="contents">
        {children}
      </div>
    </Suspense>
  );
}

/** Revisited routes: instant bg-only fallback — no black skeleton flash on back navigation. */
export function LazyRoute({ children, pathname, isDarkMode }: LazyRouteProps) {
  const isRevisit = hasVisitedRoute(pathname);
  const bg = isDarkMode ? 'bg-bg-dark' : 'bg-white';

  useEffect(() => {
    markRouteVisited(pathname);
  }, [pathname]);

  return (
    <Suspense
      fallback={
        isRevisit ? (
          <div className={`min-h-screen ${bg}`} aria-hidden />
        ) : (
          <div className={`min-h-[32vh] ${bg}`}>
            <RouteContentSkeleton pathname={pathname} isDarkMode={isDarkMode} />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}
