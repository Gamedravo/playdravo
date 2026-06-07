import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';

const SIZES = {
  xs: { icon: 24, text: 'text-sm', sub: 'text-[7px]' },
  sm: { icon: 30, text: 'text-base', sub: 'text-[8px]' },
  md: { icon: 38, text: 'text-xl', sub: 'text-[9px]' },
  lg: { icon: 46, text: 'text-2xl', sub: 'text-[10px]' },
} as const;

export interface GameDravoLogoProps {
  size?: keyof typeof SIZES;
  showWordmark?: boolean;
  /** Extra Tailwind classes applied to the wordmark wrapper span */
  wordmarkClassName?: string;
  className?: string;
  /** Render as home link */
  href?: string;
  onClick?: (e: MouseEvent) => void;
}

export function GameDravoLogo({
  size = 'md',
  showWordmark = true,
  wordmarkClassName,
  className = '',
  href,
  onClick,
}: GameDravoLogoProps) {
  const dim = SIZES[size];
  const inner = (
    <>
      <span className="brand-mark-shell" aria-hidden>
        <img
          src="/logo.svg"
          alt=""
          width={dim.icon}
          height={dim.icon}
          className="brand-mark-img"
          decoding="async"
        />
      </span>
      {showWordmark && (
        <span className={wordmarkClassName ?? 'brand-wordmark'}>
          <span className={`brand-title ${dim.text}`}>
            Game<span>Dravo</span>
          </span>
          <span className={`brand-subtitle ${dim.sub}`}>instant lightweight play</span>
        </span>
      )}
    </>
  );

  const cls = `brand-logo ${className}`;

  if (href) {
    return (
      <Link to={href} className={cls} onClick={onClick} title="GameDravo Home" aria-label="GameDravo Home">
        {inner}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" className={`${cls} cursor-pointer`} onClick={onClick} title="GameDravo Home" aria-label="GameDravo Home">
        {inner}
      </button>
    );
  }

  return <span className={cls}>{inner}</span>;
}

/** Icon-only mark for collapsed sidebar / favicon contexts */
export function GameDravoMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <span className={`brand-mark-shell ${className}`} aria-label="GameDravo">
      <img
        src="/logo.svg"
        alt="GameDravo"
        width={size}
        height={size}
        className="brand-mark-img"
        decoding="async"
      />
    </span>
  );
}
