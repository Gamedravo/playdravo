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

const PANEL_WIDTH = 360;
const LIST_MAX_HEIGHT = 380;

function formatTimeAgo(isoString: string) {
  try {
    const diffMins = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
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
      top: rect.bottom + 2,
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
    ? 'bg-[#1a1a24] text-white border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.45)]'
    : 'bg-white text-black border-black/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.12)]';

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
        className={`fixed z-[120] border ${panelSurface} ${isMobile ? 'left-0 right-0 rounded-b-md' : 'rounded-md'}`}
        style={{
          top: position.top,
          left: isMobile ? 0 : position.left,
          width: isMobile ? '100%' : PANEL_WIDTH,
        }}
      >
        <div
          className={`flex items-center justify-between gap-1.5 px-3 py-2 border-b ${
            isDarkMode ? 'border-white/[0.06]' : 'border-black/[0.06]'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[13px] font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold bg-accent text-bg-dark rounded-full">
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
                  className={`p-1 rounded hover:bg-white/10 ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}
                  title="Mark all read"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearAll();
                    toast.success('Cleared');
                  }}
                  className={`p-1 rounded hover:bg-white/10 ${isDarkMode ? 'text-white/45' : 'text-black/45'}`}
                  title="Clear all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`p-1 rounded hover:bg-white/10 ${isDarkMode ? 'text-white/45' : 'text-black/45'}`}
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {hasAny && (
          <div
            className={`flex gap-3 px-3 border-b ${isDarkMode ? 'border-white/[0.06]' : 'border-black/[0.06]'}`}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-1.5 text-[11px] font-semibold border-b-2 -mb-px transition-colors duration-75 ${
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

        {!hasVisible ? (
          <div className="flex flex-col items-center justify-center text-center px-4 py-7">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${
                isDarkMode ? 'bg-white/[0.05]' : 'bg-black/[0.04]'
              }`}
            >
              <Bell className={`w-3.5 h-3.5 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`} />
            </div>
            <p className="text-[13px] font-semibold">You&apos;re all caught up</p>
            <p className={`text-[11px] mt-0.5 leading-snug ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
              {hasAny ? 'Nothing in this tab.' : 'Updates appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto overflow-x-hidden py-1" style={{ maxHeight: LIST_MAX_HEIGHT }}>
            {filteredNotifications.map((notif) => {
              const unread = !notif.read;
              return (
                <div
                  key={notif.id}
                  role="menuitem"
                  onClick={() => markAsRead(notif.id)}
                  className={`group flex items-start gap-2 mx-1 px-2 py-1.5 rounded cursor-pointer transition-colors duration-75 ${
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
                    className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-px ${
                      isDarkMode ? 'bg-white/[0.06]' : 'bg-black/[0.04]'
                    }`}
                  >
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-semibold leading-tight line-clamp-1 ${unread ? '' : 'opacity-75'}`}>
                      {notif.title}
                    </p>
                    <p className={`text-[10px] leading-snug line-clamp-2 ${isDarkMode ? 'text-white/45' : 'text-black/45'}`}>
                      {notif.description}
                    </p>
                    <span className={`text-[9px] ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>
                      {formatTimeAgo(notif.timestamp)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notif.id);
                    }}
                    className={`shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 ${
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
    ) : null,
    document.body
  );
}
