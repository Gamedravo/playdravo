import type { MouseEvent } from 'react';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayDravoLogo } from './PlayDravoLogo';
import { useSidebarOpen } from '../contexts/SidebarContext';

interface HeaderBrandProps {
  onHome?: () => void;
}

/** Single brand instance: mobile always; desktop only when sidebar collapsed. */
export const HeaderBrand = memo(function HeaderBrand({ onHome }: HeaderBrandProps) {
  const navigate = useNavigate();
  const sidebarOpen = useSidebarOpen();

  const goHome = (e: MouseEvent) => {
    e.preventDefault();
    navigate('/');
    onHome?.();
    document.querySelector('main')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  return (
    <>
      {/* Mobile: always show brand (sidebar is overlay) */}
      <PlayDravoLogo
        size="sm"
        showWordmark
        onClick={goHome}
        className="md:hidden"
      />
      {/* Desktop: brand only when sidebar collapsed — sidebar owns brand when open */}
      {!sidebarOpen && (
        <PlayDravoLogo
          size="sm"
          showWordmark
          onClick={goHome}
          className="hidden md:inline-flex"
        />
      )}
    </>
  );
});
