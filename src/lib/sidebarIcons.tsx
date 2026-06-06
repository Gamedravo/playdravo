import {
  Home,
  Heart,
  Sparkles,
  Clock,
  TrendingUp,
  Package,
  Smartphone,
  Star,
  Zap,
  Mountain,
  Joystick,
  CreditCard,
  Smile,
  BookOpen,
  Swords,
  Users,
  User,
  UserPlus,
  UserRound,
  UsersRound,
  ChevronsUp,
  Puzzle,
  Gauge,
  SlidersHorizontal,
  Trophy,
  Brain,
  Skull,
  Rocket,
  Dices,
  type LucideIcon,
} from 'lucide-react';

const SIDEBAR_ICON_MAP: Record<string, LucideIcon> = {
  All: Home,
  Favorites: Heart,
  Recommended: Sparkles,
  History: Clock,
  Trending: TrendingUp,
  Mods: Package,
  'Mobile Games': Smartphone,
  'Best On Mobile': Star,
  Action: Zap,
  Adventure: Mountain,
  Arcade: Joystick,
  Card: CreditCard,
  Casual: Smile,
  Educational: BookOpen,
  Fighting: Swords,
  Horror: Skull,
  Multiplayer: Users,
  '1 Player': User,
  '2 Player': UserPlus,
  '3 Player': UserRound,
  '4 Player': UsersRound,
  Platformer: ChevronsUp,
  Puzzle: Puzzle,
  Racing: Gauge,
  Simulator: SlidersHorizontal,
  Sports: Trophy,
  Strategy: Brain,
  Obby: Rocket,
  Idle: Dices,
};

const SIDEBAR_ICON_COLORS: Record<string, string> = {
  All:             '#94a3b8', // slate — neutral home
  Favorites:       '#f43f5e', // rose — love/heart
  Recommended:     '#a855f7', // purple — sparkle magic
  History:         '#78716c', // stone — past/time
  Trending:        '#f97316', // orange — fire trending
  Mods:            '#facc15', // yellow — tools/package
  'Mobile Games':  '#22d3ee', // cyan — mobile screen
  'Best On Mobile':'#fbbf24', // amber — gold star
  Action:          '#ef4444', // red — high energy
  Adventure:       '#22c55e', // green — outdoor mountain
  Arcade:          '#3b82f6', // blue — classic arcade
  Card:            '#818cf8', // indigo — card games
  Casual:          '#84cc16', // lime — light/fun
  Educational:     '#10b981', // emerald — learning/growth
  Fighting:        '#dc2626', // deep red — combat
  Horror:          '#7c3aed', // violet — dark/scary
  Multiplayer:     '#e879f9', // fuchsia — social/crowd
  '1 Player':      '#38bdf8', // sky — solo flight
  '2 Player':      '#2dd4bf', // teal — duo
  '3 Player':      '#4ade80', // light green — trio
  '4 Player':      '#a78bfa', // soft violet — full crew
  Platformer:      '#fb923c', // orange — jump up
  Puzzle:          '#d946ef', // fuchsia-deep — brain twister
  Racing:          '#f59e0b', // amber — speed/throttle
  Simulator:       '#64748b', // slate — control panel
  Sports:          '#16a34a', // deep green — grass/field
  Strategy:        '#1d4ed8', // deep blue — chess/mind
  Obby:            '#ec4899', // pink — parkour fun
  Idle:            '#9ca3af', // gray — chill/idle
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
