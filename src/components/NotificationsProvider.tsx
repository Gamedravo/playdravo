import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { appToast, isToastGameMode } from '../lib/appToast';

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

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [userId, setUserId] = useState<string>('guest');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : 'guest');
    });
    return unsubscribe;
  }, []);

  const getStorageKey = useCallback(() => `playdravo_notifications_${userId}`, [userId]);

  useEffect(() => {
    const key = getStorageKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch {
        setNotifications([]);
      }
    } else {
      const initial: AppNotification[] = [
        {
          id: 'welcome',
          title: 'Welcome to PlayDravo',
          description: 'Browse 260+ HTML5 games. Log in to save favorites and track achievements.',
          type: 'system',
          timestamp: new Date().toISOString(),
          read: false
        }
      ];
      setNotifications(initial);
      localStorage.setItem(key, JSON.stringify(initial));
    }
  }, [userId, getStorageKey]);

  const persist = useCallback((updated: AppNotification[]) => {
    setNotifications(updated);
    localStorage.setItem(getStorageKey(), JSON.stringify(updated));
  }, [getStorageKey]);

  const addNotification = useCallback((
    notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>,
    options?: { toast?: boolean }
  ) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications((prev) => {
      const updated = [newNotif, ...prev].slice(0, 50);
      localStorage.setItem(getStorageKey(), JSON.stringify(updated));
      return updated;
    });

    const showToast = options?.toast !== false;
    if (!showToast || isToastGameMode()) return;
    if (notif.type === 'game') return;

    if (notif.type === 'achievement') {
      appToast.success(newNotif.title, { description: newNotif.description });
    } else {
      appToast.message(newNotif.title, { description: newNotif.description });
    }
  }, [getStorageKey]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem(getStorageKey(), JSON.stringify(updated));
      return updated;
    });
  }, [getStorageKey]);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem(getStorageKey(), JSON.stringify(updated));
      return updated;
    });
  }, [getStorageKey]);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem(getStorageKey(), JSON.stringify(updated));
      return updated;
    });
  }, [getStorageKey]);

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll
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
