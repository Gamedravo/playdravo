import { PlayDravoLogo } from './PlayDravoLogo';

/** Compact linked logo for static page headers (Support, Terms, etc.) */
export function PageBrandMark({ className = '' }: { className?: string }) {
  return (
    <PlayDravoLogo
      size="sm"
      showWordmark
      href="/"
      className={`self-start sm:self-auto shrink-0 ${className}`}
    />
  );
}
