import { useQuery, useQueryClient } from '@tanstack/react-query';
import { NotificationItem } from '../components/notifications/NotificationItem';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useRealtime } from '../context/RealtimeContext';
import * as notificationService from '../services/notification.service';
import { useEffect } from 'react';

export function NotificationsPage() {
  const { notifications, setNotifications, setUnreadCount } = useRealtime();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.fetchNotifications,
  });

  useEffect(() => {
    if (data) {
      setNotifications(data.notifications, data.unreadCount);
    }
  }, [data, setNotifications]);

  const handleMarkRead = async (id: string) => {
    const unread = await notificationService.markNotificationRead(id);
    setUnreadCount(unread);
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const handleMarkAll = async () => {
    const unread = await notificationService.markAllNotificationsRead();
    setUnreadCount(unread);
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  if (isLoading) return <LoadingSpinner />;

  const items = notifications.length ? notifications : (data?.notifications ?? []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Notifications</h1>
        <button className="btn secondary" type="button" onClick={() => void handleMarkAll()}>
          Mark all read
        </button>
      </div>
      <div className="card">
        {items.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRead={(id) => void handleMarkRead(id)}
          />
        ))}
      </div>
    </div>
  );
}
