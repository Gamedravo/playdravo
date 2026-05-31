import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

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
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [userId, setUserId] = useState<string>('guest');

  // Track the logged-in status of the user to isolate local storage keys
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId('guest');
      }
    });
    return unsubscribe;
  }, []);

  const getStorageKey = useCallback(() => `playdravo_notifications_${userId}`, [userId]);

  // Load notifications from local storage on user swap
  useEffect(() => {
    const key = getStorageKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (e) {
        setNotifications([]);
      }
    } else {
      // Default initial welcome notifications
      const initial: AppNotification[] = [
        {
          id: 'welcome',
          title: 'Welcome to PlayDravo! 🚀',
          description: 'Browse 60+ high-quality HTML5 games! Log in to save your progress, select gamer personas, and earn achievements.',
          type: 'system',
          timestamp: new Date().toISOString(),
          read: false
        },
        {
          id: 'xp-tip',
          title: 'Double XP Weekend is Live! 🎉',
          description: 'Ready to level up? Every game you play this weekend awards DOUBLE XP. Earn experience to customize your gamer profile.',
          type: 'achievement',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false
        },
        {
          id: 'new-games',
          title: 'New Games Added! 🎮',
          description: 'Check out the latest additions in New Arrivals. Fresh titles are added regularly to keep things exciting.',
          type: 'game',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: false
        }
      ];
      setNotifications(initial);
      localStorage.setItem(key, JSON.stringify(initial));
    }
  }, [userId, getStorageKey]);

  // Synchronize state back to local storage
  const saveNotifications = useCallback((updated: AppNotification[]) => {
    setNotifications(updated);
    localStorage.setItem(getStorageKey(), JSON.stringify(updated));
  }, [getStorageKey]);

  // Add a brand-new notification with sound and toast notification
  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    saveNotifications([newNotif, ...notifications].slice(0, 50)); // Cap at 50 to maintain fast performance

    // Trigger in-app toast notification with responsive style matching PlayDravo accent
    toast(newNotif.title, {
      description: newNotif.description,
      duration: 4000
    });
  }, [notifications, saveNotifications]);

  const markAsRead = useCallback((id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const markAllAsRead = useCallback(() => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const clearNotification = useCallback((id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const clearAll = useCallback(() => {
    saveNotifications([]);
  }, [saveNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotification,
      clearAll
    }}>
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
