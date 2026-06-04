import type { ReactNode } from 'react';
import { Suspense, useEffect, useRef } from 'react';
import { RouteContentSkeleton } from '../components/LoadingSkeletons';
import { hasVisitedRoute, markRouteVisited } from '../lib/routeVisitCache';

interface LazyRouteProps {
  children: ReactNode;
  pathname: string;
  isDarkMode: boolean;
}

/** 
 * Revisited routes: instant bg-only fallback — no black skeleton flash on back navigation.
 * Uses startTransition-like behavior by keeping previous content visible until new content is ready.
 */
export function LazyRoute({ children, pathname, isDarkMode }: LazyRouteProps) {
  const isRevisit = hasVisitedRoute(pathname);
  const bg = isDarkMode ? 'bg-bg-dark' : 'bg-white';
  const prevChildrenRef = useRef<ReactNode>(null);

  useEffect(() => {
    markRouteVisited(pathname);
  }, [pathname]);

  // For revisits, show a minimal background placeholder that won't flash
  const fallback = isRevisit ? (
    <div className={`min-h-screen ${bg}`} aria-hidden>
      {/* Keep previous content shape to prevent layout shift */}
      <div className="opacity-0 pointer-events-none">{prevChildrenRef.current}</div>
    </div>
  ) : (
    <div className={`min-h-[32vh] ${bg}`}>
      <RouteContentSkeleton pathname={pathname} isDarkMode={isDarkMode} />
    </div>
  );

  // Store current children for potential reuse in fallback
  useEffect(() => {
    prevChildrenRef.current = children;
  }, [children]);

  return (
    <Suspense fallback={fallback}>
      <div className="animate-in fade-in duration-150">
        {children}
      </div>
    </Suspense>
  );
}
