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

export function SidebarIcon({ name, active }: { name: string; active?: boolean }) {
  const Icon = SIDEBAR_ICON_MAP[name] ?? Joystick;
  return (
    <span
      className={`sidebar-icon ${active ? 'sidebar-icon--active' : ''}`}
      aria-hidden
    >
      <Icon className="w-[15px] h-[15px]" strokeWidth={1.85} />
    </span>
  );
}
