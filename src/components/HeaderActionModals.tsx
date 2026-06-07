import { Bell, CheckCheck, Heart, Play, Radio, Sparkles, Trash2 } from 'lucide-react';
import { Game } from '../types';
import { useNotifications } from './NotificationsProvider';
import { ModalShell } from './ui/ModalShell';

interface HeaderActionModalsProps {
  isDarkMode: boolean;
  likedGames: Game[];
  isNotificationsOpen: boolean;
  isLikedGamesOpen: boolean;
  onCloseNotifications: () => void;
  onCloseLikedGames: () => void;
  onGameClick: (game: Game) => void;
}

export function HeaderActionModals({
  isDarkMode,
  likedGames,
  isNotificationsOpen,
  isLikedGamesOpen,
  onCloseNotifications,
  onCloseLikedGames,
  onGameClick,
}: HeaderActionModalsProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  } = useNotifications();

  const panelClass = isDarkMode
    ? 'border-cyan-300/20 bg-[#050817] text-white'
    : 'border-violet-500/15 bg-white text-black';

  return (
    <>
      <ModalShell
        isOpen={isNotificationsOpen}
        onClose={onCloseNotifications}
        isDarkMode={isDarkMode}
        maxWidth="max-w-2xl"
        zIndex={2100}
        padding="p-0"
      >
        <div className={`relative overflow-hidden rounded-2xl border ${panelClass}`}>
          <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
            <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute -right-16 top-12 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.05)_1px,transparent_1px)] bg-[size:42px_42px]" />
          </div>

          <div className="relative z-10 border-b border-white/10 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4 pr-10">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">
                  <Radio className="h-3.5 w-3.5" />
                  Signal inbox
                </div>
                <h2 className="text-2xl font-black tracking-[-0.04em]">Notifications</h2>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-white/50' : 'text-black/55'}`}>
                  {unreadCount ? `${unreadCount} unread system ping${unreadCount === 1 ? '' : 's'}.` : 'All signals are clear.'}
                </p>
              </div>
              <div className="hidden rounded-2xl border border-cyan-300/20 bg-black/25 p-3 text-cyan-200 sm:block">
                <Bell className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold transition-colors hover:border-cyan-300/40 hover:text-cyan-200"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold transition-colors hover:border-red-400/40 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>

          <div className="relative z-10 max-h-[58vh] space-y-2 overflow-y-auto p-4 sm:p-5">
            {notifications.length ? notifications.map((notification) => (
              <div
                key={notification.id}
                className={`group rounded-2xl border p-4 transition-all ${
                  notification.read
                    ? 'border-white/10 bg-white/[0.035] opacity-70'
                    : 'border-cyan-300/25 bg-cyan-300/[0.08] shadow-[0_0_28px_rgba(34,211,238,0.10)]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${notification.read ? 'bg-white/25' : 'bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,1)]'}`} />
                      <p className="truncate text-sm font-black">{notification.title}</p>
                    </div>
                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-white/55' : 'text-black/55'}`}>
                      {notification.description}
                    </p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-cyan-200/60">
                      {notification.type} · {new Date(notification.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                    {!notification.read && (
                      <button
                        type="button"
                        onClick={() => markAsRead(notification.id)}
                        className="rounded-lg border border-white/10 bg-black/20 p-2 hover:border-cyan-300/40"
                        aria-label="Mark notification as read"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => clearNotification(notification.id)}
                      className="rounded-lg border border-white/10 bg-black/20 p-2 hover:border-red-400/40 hover:text-red-300"
                      aria-label="Clear notification"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.035] p-8 text-center">
                <Sparkles className="mx-auto mb-3 h-8 w-8 text-cyan-200" />
                <p className="font-black">No notifications yet</p>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-white/45' : 'text-black/50'}`}>Your futuristic signal feed is empty.</p>
              </div>
            )}
          </div>
        </div>
      </ModalShell>

      <ModalShell
        isOpen={isLikedGamesOpen}
        onClose={onCloseLikedGames}
        isDarkMode={isDarkMode}
        maxWidth="max-w-4xl"
        zIndex={2100}
        padding="p-0"
      >
        <div className={`relative overflow-hidden rounded-2xl border ${panelClass}`}>
          <div className="pointer-events-none absolute inset-0 opacity-75" aria-hidden>
            <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.09),transparent_24%),linear-gradient(rgba(34,211,238,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.045)_1px,transparent_1px)] bg-[size:100%_100%,38px_38px,38px_38px]" />
          </div>

          <div className="relative z-10 border-b border-white/10 p-5 sm:p-6 pr-14">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-pink-300/25 bg-pink-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-pink-200">
              <Heart className="h-3.5 w-3.5 fill-current" />
              Favorite vault
            </div>
            <h2 className="text-2xl font-black tracking-[-0.04em]">Liked Games</h2>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-white/50' : 'text-black/55'}`}>
              {likedGames.length ? `${likedGames.length} saved launch target${likedGames.length === 1 ? '' : 's'} ready.` : 'Like games to build your personal launch vault.'}
            </p>
          </div>

          <div className="relative z-10 max-h-[62vh] overflow-y-auto p-4 sm:p-5">
            {likedGames.length ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {likedGames.map((game, index) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => {
                      onCloseLikedGames();
                      onGameClick(game);
                    }}
                    className="group relative min-h-[170px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-left transition-all hover:-translate-y-1 hover:border-pink-300/40 hover:shadow-[0_18px_50px_rgba(236,72,153,0.14)]"
                  >
                    <img src={game.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
                    <div className="absolute left-3 top-3 rounded-xl border border-pink-300/30 bg-black/45 px-2.5 py-1 text-[10px] font-black text-pink-100 backdrop-blur-md">
                      #{String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="absolute right-3 top-3 rounded-xl border border-white/10 bg-black/45 p-2 text-pink-200 backdrop-blur-md">
                      <Heart className="h-4 w-4 fill-current" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="line-clamp-1 text-base font-black text-white">{game.title}</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/65">
                          {game.category}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-xl bg-pink-300 px-3 py-1.5 text-[10px] font-black text-black transition-transform group-hover:-translate-y-0.5">
                          <Play className="h-3 w-3 fill-current" />
                          Play
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.035] p-10 text-center">
                <Heart className="mx-auto mb-3 h-10 w-10 text-pink-200" />
                <p className="font-black">No liked games yet</p>
                <p className={`mx-auto mt-1 max-w-sm text-sm ${isDarkMode ? 'text-white/45' : 'text-black/50'}`}>
                  Tap the heart on any game card and it will appear here as a futuristic quick-launch collection.
                </p>
              </div>
            )}
          </div>
        </div>
      </ModalShell>
    </>
  );
}
