import type { MouseEvent } from 'react';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayDravoLogo } from './PlayDravoLogo';
import { useSidebarOpen } from '../contexts/SidebarContext';

interface HeaderBrandProps {
  onHome?: () => void;
}

/** Single brand instance: show in Header only when Sidebar is closed. */
export const HeaderBrand = memo(function HeaderBrand({ onHome }: HeaderBrandProps) {
  const navigate = useNavigate();
  const sidebarOpen = useSidebarOpen();

  const goHome = (e: MouseEvent) => {
    e.preventDefault();
    navigate('/');
    onHome?.();
    document.querySelector('main')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // Avoid duplicate logos: when the sidebar is open, it owns the brand area.
  const shouldShowBrand = !sidebarOpen;

  return (
    <PlayDravoLogo
      size="sm"
      showWordmark
      onClick={goHome}
      className={shouldShowBrand ? '' : 'hidden'}
      wordmarkClassName="brand-wordmark hidden sm:flex"
    />
  );
});
