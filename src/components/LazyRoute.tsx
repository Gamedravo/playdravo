import type { ReactNode } from 'react';
import { Suspense, useEffect } from 'react';
import { RouteContentSkeleton } from '../components/LoadingSkeletons';
import { hasVisitedRoute, markRouteVisited } from '../lib/routeVisitCache';

interface LazyRouteProps {
  children: ReactNode;
  pathname: string;
  isDarkMode: boolean;
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
