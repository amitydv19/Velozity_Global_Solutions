import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { connectSocket } from '../services/socket.service';
import type { ActivityItem, Notification } from '../types';
import { useAuth } from './AuthContext';

interface RealtimeContextValue {
  activities: ActivityItem[];
  notifications: Notification[];
  unreadCount: number;
  onlineUsers: number;
  prependActivity: (activity: ActivityItem) => void;
  setCatchupActivities: (items: ActivityItem[]) => void;
  upsertNotification: (notification: Notification, unread: number) => void;
  setUnreadCount: (count: number) => void;
  setNotifications: (items: Notification[], unread: number) => void;
}

const RealtimeContext = createContext<RealtimeContextValue | undefined>(undefined);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [notifications, setNotificationsState] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCountState] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    if (!user) {
      return;
    }

    connectSocket({
      onActivityUpdate: (activity) => {
        setActivities((prev) =>
          [activity, ...prev.filter((a) => a.id !== activity.id)].slice(0, 50),
        );
      },
      onActivityCatchup: (items) => {
        setActivities(items);
      },
      onNotificationNew: ({ notification, unreadCount: count }) => {
        setNotificationsState((prev) => [
          notification,
          ...prev.filter((n) => n.id !== notification.id),
        ]);
        setUnreadCountState(count);
      },
      onNotificationCount: ({ unreadCount: count }) => {
        setUnreadCountState(count);
      },
      onPresenceUpdate: ({ onlineUsers: count }) => {
        setOnlineUsers(count);
      },
    });
  }, [user]);

  const prependActivity = useCallback((activity: ActivityItem) => {
    setActivities((prev) => [activity, ...prev.filter((a) => a.id !== activity.id)].slice(0, 50));
  }, []);

  const setCatchupActivities = useCallback((items: ActivityItem[]) => {
    setActivities(items);
  }, []);

  const upsertNotification = useCallback((notification: Notification, unread: number) => {
    setNotificationsState((prev) => [
      notification,
      ...prev.filter((n) => n.id !== notification.id),
    ]);
    setUnreadCountState(unread);
  }, []);

  const setUnreadCount = useCallback((count: number) => {
    setUnreadCountState(count);
  }, []);

  const setNotifications = useCallback((items: Notification[], unread: number) => {
    setNotificationsState(items);
    setUnreadCountState(unread);
  }, []);

  const value = useMemo(
    () => ({
      activities,
      notifications,
      unreadCount,
      onlineUsers,
      prependActivity,
      setCatchupActivities,
      upsertNotification,
      setUnreadCount,
      setNotifications,
    }),
    [
      activities,
      notifications,
      unreadCount,
      onlineUsers,
      prependActivity,
      setCatchupActivities,
      upsertNotification,
      setUnreadCount,
      setNotifications,
    ],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime(): RealtimeContextValue {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return ctx;
}
