import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, Gamepad2, Heart, Sparkles, Trash2, Trophy, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from './NotificationsProvider';

type NotificationTab = 'all' | 'rewards' | 'system' | 'activity';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const PANEL_WIDTH = 340;

function formatTimeAgo(isoString: string) {
  try {
    const diffMins = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  } catch {
    return '';
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'achievement':
      return <Trophy className="w-3.5 h-3.5 text-emerald-400" />;
    case 'game':
      return <Gamepad2 className="w-3.5 h-3.5 text-orange-400" />;
    case 'social':
      return <Heart className="w-3.5 h-3.5 text-rose-400" fill="currentColor" />;
    default:
      return <Sparkles className="w-3.5 h-3.5 text-accent" />;
  }
}

export function NotificationDrawer({ isOpen, onClose, isDarkMode }: NotificationDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAll } =
    useNotifications();

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'rewards') return n.type === 'achievement';
    if (activeTab === 'system') return n.type === 'system';
    if (activeTab === 'activity') return n.type === 'game' || n.type === 'social';
    return true;
  });

  const hasAny = notifications.length > 0;
  const hasVisible = filteredNotifications.length > 0;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  const tabs = [
    { id: 'all' as const, label: 'All' },
    { id: 'rewards' as const, label: 'Rewards' },
    { id: 'system' as const, label: 'System' },
    { id: 'activity' as const, label: 'Activity' },
  ];

  return createPortal(
    <>
      <div
        aria-hidden={!isOpen}
        onClick={onClose}
        className={`notification-drawer-backdrop fixed inset-0 z-[115] bg-black/35 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ transition: 'opacity 80ms ease-out' }}
      />
      <div
        ref={panelRef}
        id="header-notification-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        aria-hidden={!isOpen}
        className={`notification-drawer fixed z-[120] flex flex-col border-l ${
          isDarkMode
            ? 'bg-[#12121a] text-white border-white/[0.08] shadow-[-8px_0_32px_rgba(0,0,0,0.45)]'
            : 'bg-white text-black border-black/[0.08] shadow-[-8px_0_32px_rgba(0,0,0,0.12)]'
        } ${isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}
        style={{
          top: 'max(8px, env(safe-area-inset-top, 0px))',
          right: 0,
          width: `min(${PANEL_WIDTH}px, calc(100vw - 16px))`,
          height: 'min(85vh, calc(100dvh - 16px))',
          maxHeight: 'calc(100dvh - 16px)',
          transition: 'transform 100ms ease-out',
        }}
      >
        <div
          className={`flex items-center justify-between gap-2 px-4 py-3 border-b shrink-0 ${
            isDarkMode ? 'border-white/[0.06]' : 'border-black/[0.06]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Bell className="w-4 h-4 text-accent shrink-0" />
            <span className="text-sm font-bold">Notifications</span>
            {unreadCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-accent text-bg-dark rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center shrink-0">
            {hasAny && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    markAllAsRead();
                    toast.success('All marked read');
                  }}
                  className={`p-1.5 rounded-lg hover:bg-white/10 ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}
                  title="Mark all read"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearAll();
                    toast.success('Cleared');
                  }}
                  className={`p-1.5 rounded-lg hover:bg-white/10 ${isDarkMode ? 'text-white/45' : 'text-black/45'}`}
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg hover:bg-white/10 ${isDarkMode ? 'text-white/45' : 'text-black/45'}`}
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {hasAny && (
          <div
            className={`flex gap-3 px-4 border-b shrink-0 ${
              isDarkMode ? 'border-white/[0.06]' : 'border-black/[0.06]'
            }`}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 text-[11px] font-semibold border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : `border-transparent ${isDarkMode ? 'text-white/40 hover:text-white/70' : 'text-black/40 hover:text-black/70'}`
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
          {!hasVisible ? (
            <div className="flex flex-col items-center justify-center text-center px-6 py-12">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                  isDarkMode ? 'bg-white/[0.05]' : 'bg-black/[0.04]'
                }`}
              >
                <Bell className={`w-4 h-4 ${isDarkMode ? 'text-white/35' : 'text-black/35'}`} />
              </div>
              <p className="text-sm font-semibold">You&apos;re all caught up</p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                {hasAny ? 'Nothing in this tab.' : 'Updates appear here.'}
              </p>
            </div>
          ) : (
            <div className="py-1">
              {filteredNotifications.map((notif) => {
                const unread = !notif.read;
                return (
                  <div
                    key={notif.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => markAsRead(notif.id)}
                    onKeyDown={(e) => e.key === 'Enter' && markAsRead(notif.id)}
                    className={`group flex items-start gap-3 px-4 py-2.5 cursor-pointer ${
                      unread
                        ? isDarkMode
                          ? 'bg-white/[0.03]'
                          : 'bg-black/[0.02]'
                        : isDarkMode
                          ? 'hover:bg-white/[0.04]'
                          : 'hover:bg-black/[0.03]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isDarkMode ? 'bg-white/[0.06]' : 'bg-black/[0.04]'
                      }`}
                    >
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold leading-snug line-clamp-2 ${unread ? '' : 'opacity-75'}`}>
                          {notif.title}
                        </p>
                        <span className={`text-[10px] shrink-0 ${isDarkMode ? 'text-white/35' : 'text-black/35'}`}>
                          {formatTimeAgo(notif.timestamp)}
                        </span>
                      </div>
                      <p className={`text-[11px] leading-snug line-clamp-2 mt-0.5 ${isDarkMode ? 'text-white/45' : 'text-black/45'}`}>
                        {notif.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification(notif.id);
                      }}
                      className={`shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 ${
                        isDarkMode ? 'text-white/35 hover:bg-white/10' : 'text-black/35 hover:bg-black/10'
                      }`}
                      aria-label="Dismiss"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}

/** @deprecated Use NotificationDrawer */
export { NotificationDrawer as NotificationDropdown };
