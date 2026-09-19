import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import * as notificationService from '../../services/notification.service';
import { NotificationDropdown } from './NotificationDropdown';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, setNotifications, setUnreadCount } = useRealtime();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.fetchNotifications,
  });

  useEffect(() => {
    if (data) {
      setNotifications(data.notifications, data.unreadCount);
    }
  }, [data, setNotifications]);

  const handleMarkRead = async (id: string) => {
    const count = await notificationService.markNotificationRead(id);
    setUnreadCount(count);
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const handleMarkAll = async () => {
    const count = await notificationService.markAllNotificationsRead();
    setUnreadCount(count);
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="btn secondary"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 ? (
          <span
            style={{
              marginLeft: '0.35rem',
              background: '#dc2626',
              color: '#fff',
              borderRadius: 999,
              padding: '0 0.35rem',
              fontSize: '0.75rem',
            }}
          >
            {unreadCount}
          </span>
        ) : null}
      </button>
      <NotificationDropdown
        open={open}
        notifications={notifications}
        onMarkRead={(id) => void handleMarkRead(id)}
        onMarkAllRead={() => void handleMarkAll()}
      />
    </div>
  );
}
