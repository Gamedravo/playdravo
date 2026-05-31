import { memo } from 'react';
import { Link } from 'react-router-dom';
import { SidebarIcon } from '../lib/sidebarIcons';

interface SidebarNavLinkProps {
  to: string;
  label: string;
  cat: string;
  isActive: boolean;
  isDarkMode: boolean;
  onNavigate: () => void;
}

export const SidebarNavLink = memo(function SidebarNavLink({
  to,
  label,
  cat,
  isActive,
  isDarkMode,
  onNavigate,
}: SidebarNavLinkProps) {
  const cls = `sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''} ${
    isDarkMode ? 'sidebar-nav-item--dark' : 'sidebar-nav-item--light'
  }`;

  return (
    <Link to={to} onClick={onNavigate} className={cls} title={label} data-tooltip={label}>
      <SidebarIcon name={cat} active={isActive} />
      <span className="sidebar-label">{label}</span>
    </Link>
  );
});
