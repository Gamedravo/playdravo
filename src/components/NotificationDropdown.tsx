import { useEffect, useRef, useState, memo } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { Bell, Check, Gamepad2, Heart, Sparkles, Trash2, Trophy, X } from 'lucide-react';
import { appToast } from '../lib/appToast';
import { useNotifications } from './NotificationsProvider';

type NotificationTab = 'all' | 'rewards' | 'system' | 'activity';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
}

const PANEL_W = 320;
const HEADER_OFFSET = 56;
const GAME_MAX_ITEMS = 2;
const DEFAULT_MAX_ITEMS = 10;

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
      return <Trophy className="w-3 h-3 text-emerald-400" />;
    case 'game':
      return <Gamepad2 className="w-3 h-3 text-orange-400" />;
    case 'social':
      return <Heart className="w-3 h-3 text-rose-400" fill="currentColor" />;
    default:
      return <Sparkles className="w-3 h-3 text-accent" />;
  }
}

function useAnchorPosition(anchorRef: React.RefObject<HTMLElement | null>, isOpen: boolean) {
  const [pos, setPos] = useState({ top: HEADER_OFFSET, right: 0, width: PANEL_W });

  useEffect(() => {
    if (!isOpen) return;

    const update = () => {
      const isMobile = window.innerWidth < 768;
      const width = isMobile ? Math.min(window.innerWidth, PANEL_W) : PANEL_W;
      setPos({
        top: HEADER_OFFSET,
        right: isMobile ? 0 : 0,
        width: isMobile ? window.innerWidth : width,
      });
    };

    update();
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, [isOpen]);

  return pos;
}

export const NotificationDrawer = memo(function NotificationDrawer({
  isOpen,
  onClose,
  isDarkMode,
  anchorRef,
}: NotificationDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const location = useLocation();
  const isGameRoute = /^\/games\/[^/]+/.test(location.pathname);
  const pos = useAnchorPosition(anchorRef, isOpen);

  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotifications();

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'rewards') return n.type === 'achievement';
    if (activeTab === 'system') return n.type === 'system';
    if (activeTab === 'activity') return n.type === 'game' || n.type === 'social';
    return true;
  });

  const maxItems = isGameRoute ? GAME_MAX_ITEMS : DEFAULT_MAX_ITEMS;
  const visibleNotifications = filteredNotifications.slice(0, maxItems);
  const hasAny = notifications.length > 0;
  const hasVisible = visibleNotifications.length > 0;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const handlePointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointer);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointer);
    };
  }, [isOpen, onClose, anchorRef]);

  if (typeof document === 'undefined' || !isOpen) return null;

  const tabs = [
    { id: 'all' as const, label: 'All' },
    { id: 'rewards' as const, label: 'Rewards' },
    { id: 'system' as const, label: 'System' },
    { id: 'activity' as const, label: 'Activity' },
  ];

  const maxH = isGameRoute
    ? 'calc(100dvh - 56px)'
    : 'calc(100dvh - 56px)';

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close notifications"
        className="fixed inset-0 z-[119] bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div
      ref={panelRef}
      id="header-notification-panel"
      role="dialog"
      aria-modal="false"
      aria-label="Notifications"
      className={`notification-popover fixed z-[120] flex flex-col border-l shadow-2xl overflow-hidden ${
        isDarkMode
          ? 'bg-[#14141c] text-white border-white/[0.08] shadow-black/50'
          : 'bg-white text-black border-black/[0.08] shadow-black/15'
      }`}
      style={{
        top: pos.top,
        right: pos.right,
        width: pos.width,
        height: maxH,
        maxHeight: maxH,
      }}
    >
      <div
        className={`flex items-center justify-between gap-2 px-3 py-2 border-b shrink-0 ${
          isDarkMode ? 'border-white/[0.06]' : 'border-black/[0.06]'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Bell className="w-3.5 h-3.5 text-accent shrink-0" />
          <span className="text-xs font-bold">Notifications</span>
          {unreadCount > 0 && (
            <span className="min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold bg-accent text-bg-dark rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center shrink-0 gap-0.5">
          {hasAny && (
            <>
              <button
                type="button"
                onClick={() => {
                  markAllAsRead();
                  appToast.success('All marked read');
                }}
                className={`p-1 rounded-md ${isDarkMode ? 'hover:bg-white/10 text-white/50' : 'hover:bg-black/5 text-black/50'}`}
                title="Mark all read"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAll();
                  appToast.success('Cleared');
                }}
                className={`p-1 rounded-md ${isDarkMode ? 'hover:bg-white/10 text-white/45' : 'hover:bg-black/5 text-black/45'}`}
                title="Clear all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-md ${isDarkMode ? 'hover:bg-white/10 text-white/45' : 'hover:bg-black/5 text-black/45'}`}
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {hasAny && !isGameRoute && (
        <div
          className={`flex gap-2 px-3 border-b shrink-0 ${
            isDarkMode ? 'border-white/[0.06]' : 'border-black/[0.06]'
          }`}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 text-[10px] font-semibold border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : `border-transparent ${isDarkMode ? 'text-white/40' : 'text-black/40'}`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {!hasVisible ? (
          <div className="flex flex-col items-center text-center px-4 py-8">
            <Bell className={`w-4 h-4 mb-2 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`} />
            <p className="text-xs font-semibold">All caught up</p>
          </div>
        ) : (
          <ul className={`py-1 ${isDarkMode ? 'divide-white/[0.04]' : 'divide-black/[0.04]'} divide-y`}>
            {visibleNotifications.map((notif) => {
              const unread = !notif.read;
              return (
                <li key={notif.id}>
                  <button
                    type="button"
                    onClick={() => markAsRead(notif.id)}
                    className={`w-full flex items-start gap-2 px-3 text-left ${
                      isGameRoute ? 'py-1.5' : 'py-2'
                    } ${
                      unread
                        ? isDarkMode
                          ? 'bg-white/[0.03]'
                          : 'bg-black/[0.02]'
                        : isDarkMode
                          ? 'hover:bg-white/[0.04]'
                          : 'hover:bg-black/[0.03]'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                        isDarkMode ? 'bg-white/[0.06]' : 'bg-black/[0.04]'
                      }`}
                    >
                      {getNotificationIcon(notif.type)}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-start justify-between gap-1">
                        <span className={`text-[11px] font-semibold leading-snug line-clamp-1 ${unread ? '' : 'opacity-75'}`}>
                          {notif.title}
                        </span>
                        <span className={`text-[9px] shrink-0 ${isDarkMode ? 'text-white/35' : 'text-black/35'}`}>
                          {formatTimeAgo(notif.timestamp)}
                        </span>
                      </span>
                      {!isGameRoute && (
                        <span className={`text-[10px] leading-snug line-clamp-1 mt-0.5 ${isDarkMode ? 'text-white/45' : 'text-black/45'}`}>
                          {notif.description}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {filteredNotifications.length > maxItems && (
          <p className={`text-center text-[10px] py-2 ${isDarkMode ? 'text-white/35' : 'text-black/35'}`}>
            +{filteredNotifications.length - maxItems} more in inbox
          </p>
        )}
      </div>
    </div>
    </>,
    document.body
  );
});

/** @deprecated Use NotificationDrawer */
export { NotificationDrawer as NotificationDropdown };
