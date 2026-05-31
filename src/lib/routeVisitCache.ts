/** Routes that have completed at least one Suspense resolve — skip heavy skeleton on revisit. */
const visited = new Set<string>();

export function markRouteVisited(pathname: string) {
  visited.add(pathname);
}

export function hasVisitedRoute(pathname: string): boolean {
  return visited.has(pathname);
}
