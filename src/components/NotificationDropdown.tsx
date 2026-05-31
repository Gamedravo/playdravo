import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Check,
  Gamepad2,
  Heart,
  Sparkles,
  Trash2,
  Trophy,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from './NotificationsProvider';

type NotificationTab = 'all' | 'rewards' | 'system' | 'activity';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

const PANEL_WIDTH = 400;

function formatTimeAgo(isoString: string) {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
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
      return <Trophy className="w-4 h-4 text-emerald-400" />;
    case 'game':
      return <Gamepad2 className="w-4 h-4 text-orange-400" />;
    case 'social':
      return <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />;
    default:
      return <Sparkles className="w-4 h-4 text-accent" />;
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
  const [position, setPosition] = useState({ top: 0, left: 0, width: PANEL_WIDTH });
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAll } =
    useNotifications();

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'rewards') return n.type === 'achievement';
    if (activeTab === 'system') return n.type === 'system';
    if (activeTab === 'activity') return n.type === 'game' || n.type === 'social';
    return true;
  });

  const updateLayout = () => {
    const mobile = window.innerWidth < 640;
    setIsMobile(mobile);

    if (mobile) {
      const header = document.querySelector('header');
      const headerBottom = header?.getBoundingClientRect().bottom ?? 56;
      setPosition({
        top: headerBottom,
        left: 0,
        width: window.innerWidth,
      });
      return;
    }

    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const width = PANEL_WIDTH;
    const left = Math.max(8, rect.right - width);

    setPosition({
      top: rect.bottom + 6,
      left,
      width,
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

  return createPortal(
    <AnimatePresence>
      {isOpen && (
          <motion.div
            ref={panelRef}
            key="notification-panel"
            initial={{ opacity: 0, y: isMobile ? -12 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isMobile ? -12 : -6 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            id="header-notification-panel"
            role="dialog"
            aria-label="Notifications"
            className={`fixed z-[120] flex flex-col overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.55)] border ${
              isMobile
                ? 'left-0 right-0 rounded-b-xl border-t border-white/10 max-h-[min(68vh,calc(100dvh-3.5rem))]'
                : 'rounded-xl border-white/10 max-h-[min(480px,70vh)]'
            } ${isDarkMode ? 'bg-[#14141f] text-white' : 'bg-white text-black border-black/10'}`}
            style={{
              top: position.top,
              left: isMobile ? 0 : position.left,
              width: isMobile ? '100%' : position.width,
            }}
          >
            <div className={`p-3.5 border-b flex flex-col gap-2.5 shrink-0 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-accent" />
                  <h4 className="text-sm font-bold tracking-tight">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-accent text-bg-dark rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-white/5 text-white/50 hover:text-white' : 'hover:bg-black/5 text-black/50 hover:text-black'
                  }`}
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {notifications.length > 0 && (
                <div className={`flex items-center justify-between pt-2 border-t border-dashed ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                  <button
                    onClick={() => {
                      markAllAsRead();
                      toast.success('All notifications marked as read');
                    }}
                    className="text-[11px] font-semibold text-accent hover:opacity-80 transition-all flex items-center gap-1 bg-accent/10 px-2.5 py-1 rounded-lg"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                  <button
                    onClick={() => {
                      clearAll();
                      toast.success('Cleared all notifications');
                    }}
                    className="text-[11px] font-semibold transition-all flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1 rounded-lg"
                  >
                    <Trash2 className="w-3 h-3" /> Clear all
                  </button>
                </div>
              )}
            </div>

            <div className={`flex px-3 py-1.5 border-b gap-1 overflow-x-auto shrink-0 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
              {([
                { id: 'all' as const, label: 'All' },
                { id: 'rewards' as const, label: 'Rewards' },
                { id: 'system' as const, label: 'System' },
                { id: 'activity' as const, label: 'Activity' },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-accent text-bg-dark'
                      : isDarkMode
                        ? 'text-white/40 hover:text-white/70 hover:bg-white/5'
                        : 'text-black/40 hover:text-black/70 hover:bg-black/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-1.5 min-h-0">
              {filteredNotifications.length === 0 ? (
                <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 border ${
                    isDarkMode ? 'bg-white/5 border-white/5 text-accent' : 'bg-black/5 border-black/10 text-accent'
                  }`}>
                    <Check className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-bold">You're all caught up</p>
                  <p className={`text-xs mt-1 max-w-[220px] ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                    {activeTab === 'all' ? 'No new updates right now.' : 'No alerts in this filter.'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  let themeBg = 'bg-accent/[0.02] hover:bg-accent/5 border-accent/20';
                  let iconThemeBg = 'bg-accent/15 text-accent border-accent/10';
                  let unreadBorder = 'border-l-2 border-l-accent';

                  if (notif.type === 'achievement') {
                    themeBg = 'bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05] border-emerald-500/20';
                    iconThemeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10';
                  } else if (notif.type === 'game') {
                    themeBg = 'bg-orange-500/[0.02] hover:bg-orange-500/[0.05] border-orange-500/20';
                    iconThemeBg = 'bg-orange-500/10 text-orange-400 border-orange-500/10';
                  } else if (notif.type === 'social') {
                    themeBg = 'bg-rose-500/[0.02] hover:bg-rose-500/[0.05] border-rose-500/20';
                    iconThemeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/10';
                  } else if (notif.type === 'system') {
                    themeBg = 'bg-cyan-500/[0.02] hover:bg-cyan-500/[0.05] border-cyan-500/20';
                    iconThemeBg = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/10';
                  }

                  return (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`group p-2.5 rounded-lg flex items-center gap-2.5 transition-all duration-150 cursor-pointer border relative select-none ${
                        !notif.read
                          ? `${themeBg} ${unreadBorder}`
                          : isDarkMode
                            ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                            : 'bg-black/[0.02] border-black/5 hover:bg-black/[0.03]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${iconThemeBg}`}>
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className={`text-xs font-semibold truncate ${!notif.read ? '' : isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
                            {notif.title}
                          </h5>
                          {!notif.read && <span className="w-1.5 h-1.5 shrink-0 bg-accent rounded-full" />}
                        </div>
                        <p className={`text-[11px] mt-0.5 line-clamp-2 ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                          {notif.description}
                        </p>
                        <span className={`text-[9px] mt-0.5 block font-medium uppercase tracking-wide ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>
                          {formatTimeAgo(notif.timestamp)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(notif.id);
                          toast.success('Notification removed');
                        }}
                        className={`shrink-0 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                          isDarkMode ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-black/10 text-black/40 hover:text-black'
                        }`}
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
