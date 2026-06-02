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

  // On mobile, sidebar is always an overlay, so always show brand in header
  // On desktop, only show brand when sidebar is collapsed (sidebar owns brand when open)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const shouldShowBrand = isMobile || !sidebarOpen;

  return (
    <PlayDravoLogo
      size="sm"
      showWordmark
      onClick={goHome}
      className={shouldShowBrand ? '' : 'hidden'}
    />
  );
});
