import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useReplitAuth } from '../hooks/useReplitAuth';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: 'system' | 'achievement' | 'game' | 'social';
  timestamp: string;
  read: boolean;
  link?: string;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>, options?: { toast?: boolean }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

const GUEST_NOTIFICATION: AppNotification = {
  id: 'guest-account-notice',
  title: 'No account logged in',
  description: 'Log in to save favorites, progress, and account settings.',
  type: 'system',
  timestamp: new Date(0).toISOString(),
  read: false,
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useReplitAuth();
  const [guestNoticeRead, setGuestNoticeRead] = useState(false);

  useEffect(() => {
    if (isAuthenticated) setGuestNoticeRead(false);
  }, [isAuthenticated]);

  const notifications = useMemo<AppNotification[]>(() => {
    if (isAuthenticated) return [];
    return [{ ...GUEST_NOTIFICATION, read: guestNoticeRead }];
  }, [guestNoticeRead, isAuthenticated]);

  const addNotification = useCallback(() => {}, []);

  const markAsRead = useCallback((id: string) => {
    if (id === GUEST_NOTIFICATION.id) setGuestNoticeRead(true);
  }, []);

  const markAllAsRead = useCallback(() => {
    setGuestNoticeRead(true);
  }, []);

  const clearNotification = useCallback((id: string) => {
    if (id === GUEST_NOTIFICATION.id) setGuestNoticeRead(true);
  }, []);

  const clearAll = useCallback(() => {
    setGuestNoticeRead(true);
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  }), [notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotification, clearAll]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
