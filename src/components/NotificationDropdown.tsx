import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, Gamepad2, Heart, Sparkles, Trash2, Trophy, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from './NotificationsProvider';

type NotificationTab = 'all' | 'rewards' | 'system' | 'activity';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

const PANEL_WIDTH = 268;
const LIST_MAX_HEIGHT = 300;

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

export function NotificationDropdown({
  isOpen,
  onClose,
  isDarkMode,
  anchorRef,
}: NotificationDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const [isMobile, setIsMobile] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
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

  const updateLayout = () => {
    const mobile = window.innerWidth < 640;
    setIsMobile(mobile);

    if (mobile) {
      const header = document.querySelector('header');
      const headerBottom = header?.getBoundingClientRect().bottom ?? 56;
      setPosition({ top: headerBottom, left: 0 });
      return;
    }

    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 4,
      left: Math.max(8, rect.right - PANEL_WIDTH),
    });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    updateLayout();
  }, [isOpen, anchorRef]);

  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => updateLayout();
    const onScroll = () => updateLayout();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [isOpen, anchorRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, anchorRef]);

  if (typeof document === 'undefined') return null;

  const panelSurface = isDarkMode
    ? 'bg-[#16161e] text-white border-white/[0.07] shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
    : 'bg-white text-black border-black/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.1)]';

  const tabs = [
    { id: 'all' as const, label: 'All' },
    { id: 'rewards' as const, label: 'Rewards' },
    { id: 'system' as const, label: 'System' },
    { id: 'activity' as const, label: 'Activity' },
  ];

  return createPortal(
    isOpen ? (
      <div
        ref={panelRef}
        id="header-notification-panel"
        role="menu"
        aria-label="Notifications"
        className={`fixed z-[120] border overflow-hidden ${panelSurface} ${isMobile ? 'left-0 right-0 rounded-b-lg' : 'rounded-lg'}`}
        style={{
          top: position.top,
          left: isMobile ? 0 : position.left,
          width: isMobile ? '100%' : PANEL_WIDTH,
        }}
      >
        <div
          className={`flex items-center justify-between gap-1 px-2.5 py-1.5 border-b ${
            isDarkMode ? 'border-white/[0.06]' : 'border-black/[0.06]'
          }`}
        >
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[12px] font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="min-w-[14px] h-3.5 px-1 flex items-center justify-center text-[8px] font-bold bg-accent text-bg-dark rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center shrink-0 -mr-0.5">
            {hasAny && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    markAllAsRead();
                    toast.success('All marked read');
                  }}
                  className={`p-1 rounded hover:bg-white/10 ${isDarkMode ? 'text-white/45' : 'text-black/45'}`}
                  title="Mark all read"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearAll();
                    toast.success('Cleared');
                  }}
                  className={`p-1 rounded hover:bg-white/10 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}
                  title="Clear all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`p-1 rounded hover:bg-white/10 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}
              title="Close"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {hasAny && (
          <div
            className={`flex gap-2.5 px-2.5 border-b ${isDarkMode ? 'border-white/[0.06]' : 'border-black/[0.06]'}`}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-1 text-[10px] font-semibold border-b-2 -mb-px transition-colors duration-75 ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : `border-transparent ${isDarkMode ? 'text-white/35 hover:text-white/60' : 'text-black/35 hover:text-black/60'}`
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {!hasVisible ? (
          <div className="flex flex-col items-center justify-center text-center px-3 py-5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                isDarkMode ? 'bg-white/[0.05]' : 'bg-black/[0.04]'
              }`}
            >
              <Bell className={`w-3 h-3 ${isDarkMode ? 'text-white/35' : 'text-black/35'}`} />
            </div>
            <p className="text-[11px] font-semibold">You&apos;re all caught up</p>
            <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-white/35' : 'text-black/35'}`}>
              {hasAny ? 'Nothing in this tab.' : 'Updates appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto overflow-x-hidden py-0.5" style={{ maxHeight: LIST_MAX_HEIGHT }}>
            {filteredNotifications.map((notif) => {
              const unread = !notif.read;
              return (
                <div
                  key={notif.id}
                  role="menuitem"
                  onClick={() => markAsRead(notif.id)}
                  className={`group flex items-start gap-2 px-2 py-1.5 cursor-pointer transition-colors duration-75 ${
                    unread
                      ? isDarkMode
                        ? 'bg-white/[0.025]'
                        : 'bg-black/[0.02]'
                      : isDarkMode
                        ? 'hover:bg-white/[0.04]'
                        : 'hover:bg-black/[0.03]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                      isDarkMode ? 'bg-white/[0.06]' : 'bg-black/[0.04]'
                    }`}
                  >
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-start justify-between gap-1">
                      <p className={`text-[10px] font-semibold leading-tight line-clamp-1 ${unread ? '' : 'opacity-70'}`}>
                        {notif.title}
                      </p>
                      <span className={`text-[9px] shrink-0 pt-px ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>
                        {formatTimeAgo(notif.timestamp)}
                      </span>
                    </div>
                    <p className={`text-[9px] leading-snug line-clamp-1 mt-0.5 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                      {notif.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notif.id);
                    }}
                    className={`shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 ${
                      isDarkMode ? 'text-white/30 hover:bg-white/10' : 'text-black/30 hover:bg-black/10'
                    }`}
                    aria-label="Dismiss"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    ) : null,
    document.body
  );
}
