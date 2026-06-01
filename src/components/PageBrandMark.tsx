import { PlayDravoLogo } from './PlayDravoLogo';
import { useSidebarOpen } from '../contexts/SidebarContext';

/** Compact linked logo for static page headers (Support, Terms, etc.) */
export function PageBrandMark({ className = '' }: { className?: string }) {
  const sidebarOpen = useSidebarOpen();

  // Avoid duplicate logos on mobile (Header already shows the brand).
  // Show this brand mark only on desktop, and only when the sidebar is open
  // (Header hides its brand in that state).
  if (!sidebarOpen) return null;

  return (
    <PlayDravoLogo
      size="sm"
      showWordmark
      href="/"
      className={`hidden md:inline-flex self-start sm:self-auto shrink-0 ${className}`}
    />
  );
}
