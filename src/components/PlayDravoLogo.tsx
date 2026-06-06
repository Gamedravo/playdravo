import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';

const SIZES = {
  xs: { icon: 24, text: 'text-sm' },
  sm: { icon: 28, text: 'text-base' },
  md: { icon: 36, text: 'text-xl' },
  lg: { icon: 44, text: 'text-2xl' },
} as const;

export interface PlayDravoLogoProps {
  size?: keyof typeof SIZES;
  showWordmark?: boolean;
  className?: string;
  /** Render as home link */
  href?: string;
  onClick?: (e: MouseEvent) => void;
}

export function PlayDravoLogo({
  size = 'md',
  showWordmark = true,
  className = '',
  href,
  onClick,
}: PlayDravoLogoProps) {
  const dim = SIZES[size];
  const inner = (
    <>
      <img
        src="/logo.svg"
        alt=""
        aria-hidden
        width={dim.icon}
        height={dim.icon}
        className="shrink-0 rounded-lg"
        decoding="async"
      />
      {showWordmark && (
        <span className={`font-bold tracking-tight whitespace-nowrap ${dim.text}`}>
          Game<span className="text-accent">Dravo</span>
        </span>
      )}
    </>
  );

  const cls = `inline-flex items-center gap-2 min-w-0 ${className}`;

  if (href) {
    return (
      <Link to={href} className={cls} onClick={onClick} title="GameDravo Home">
        {inner}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" className={`${cls} cursor-pointer`} onClick={onClick} title="GameDravo Home">
        {inner}
      </button>
    );
  }

  return <span className={cls}>{inner}</span>;
}

/** Icon-only mark for collapsed sidebar / favicon contexts */
export function PlayDravoMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="/logo.svg"
      alt="GameDravo"
      width={size}
      height={size}
      className={`rounded-lg shrink-0 ${className}`}
      decoding="async"
    />
  );
}
