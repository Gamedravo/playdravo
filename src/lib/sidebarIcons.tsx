import {
  Home,
  Heart,
  Sparkles,
  Clock,
  TrendingUp,
  Smartphone,
  Zap,
  Mountain,
  Joystick,
  Smile,
  Swords,
  Sparkle,
  Users,
  Puzzle,
  Gauge,
  SlidersHorizontal,
  Trophy,
  Brain,
  Target,
  Car,
  type LucideIcon,
} from 'lucide-react';
import { GAME_CATEGORIES } from './categories';

const SPECIAL_ICON_MAP: Record<string, LucideIcon> = {
  All: Home,
  Favorites: Heart,
  Recommended: Sparkles,
  History: Clock,
  Trending: TrendingUp,
};

const SPECIAL_COLOR_MAP: Record<string, string> = {
  All: '#94a3b8',
  Favorites: '#f43f5e',
  Recommended: '#a855f7',
  History: '#78716c',
  Trending: '#f97316',
};

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Action: Zap,
  Adventure: Mountain,
  Racing: Gauge,
  Sports: Trophy,
  Puzzle: Puzzle,
  Multiplayer: Users,
  Shooter: Target,
  Casual: Smile,
  Simulator: SlidersHorizontal,
  Driving: Car,
  Strategy: Brain,
  'Girls Games': Sparkle,
  'Mobile Games': Smartphone,
  Fighting: Swords,
  Arcade: Joystick,
};

const SIDEBAR_ICON_MAP: Record<string, LucideIcon> = {
  ...SPECIAL_ICON_MAP,
  ...CATEGORY_ICON_MAP,
};

const CATEGORY_COLOR_MAP: Record<string, string> = Object.fromEntries(
  GAME_CATEGORIES.map((c) => [c.label, c.color]),
);

const SIDEBAR_ICON_COLORS: Record<string, string> = {
  ...SPECIAL_COLOR_MAP,
  ...CATEGORY_COLOR_MAP,
};

export function SidebarIcon({ name, active }: { name: string; active?: boolean }) {
  const Icon = SIDEBAR_ICON_MAP[name] ?? Joystick;
  const color = SIDEBAR_ICON_COLORS[name] ?? '#60a5fa';

  return (
    <span
      className={`sidebar-icon ${active ? 'sidebar-icon--active' : ''}`}
      aria-hidden
      style={{ color: active ? color : `${color}cc` }}
    >
      <Icon className="w-[15px] h-[15px]" strokeWidth={1.85} />
    </span>
  );
}
