import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { RouteContentSkeleton } from '../components/LoadingSkeletons';

interface LazyRouteProps {
  children: ReactNode;
  pathname: string;
  isDarkMode: boolean;
}

/** Per-route Suspense — keeps Home/Search/Game mounts instant without blocking siblings. */
export function LazyRoute({ children, pathname, isDarkMode }: LazyRouteProps) {
  return (
    <Suspense
      fallback={
        <div className={`min-h-[60vh] ${isDarkMode ? 'bg-bg-dark' : 'bg-white'}`}>
          <RouteContentSkeleton pathname={pathname} isDarkMode={isDarkMode} />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
