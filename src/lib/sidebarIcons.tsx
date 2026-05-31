import {
  Home,
  Heart,
  Sparkles,
  Clock,
  Flame,
  Zap,
  Map,
  Gamepad2,
  Smile,
  Skull,
  Puzzle,
  Wrench,
  ArrowRightLeft,
  Trophy,
  Brain,
  Users,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';

const SIDEBAR_ICON_MAP: Record<string, LucideIcon> = {
  All: Home,
  Favorites: Heart,
  Recommended: Sparkles,
  History: Clock,
  Trending: Flame,
  Action: Zap,
  Adventure: Map,
  Arcade: Gamepad2,
  Casual: Smile,
  Horror: Skull,
  Puzzle: Puzzle,
  Simulator: Wrench,
  Obby: ArrowRightLeft,
  Sports: Trophy,
  Strategy: Brain,
  Multiplayer: Users,
  '2 Player': UserPlus,
  '3 Player': Users,
  '4 Player': Users,
};

export function SidebarIcon({ name, active }: { name: string; active?: boolean }) {
  const Icon = SIDEBAR_ICON_MAP[name] ?? Gamepad2;
  return (
    <span
      className={`sidebar-icon ${active ? 'sidebar-icon--active' : ''}`}
      aria-hidden
    >
      <Icon className="w-[15px] h-[15px]" strokeWidth={active ? 2.25 : 1.85} />
    </span>
  );
}
