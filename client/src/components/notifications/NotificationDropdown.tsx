import type { Notification } from '../../types';
import { NotificationItem } from './NotificationItem';

export function NotificationDropdown({
  open,
  notifications,
  onMarkRead,
  onMarkAllRead,
}: {
  open: boolean;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="card"
      style={{
        position: 'absolute',
        right: 0,
        top: '120%',
        width: 'min(360px, 90vw)',
        zIndex: 40,
        maxHeight: '420px',
        overflow: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Notifications</strong>
        <button className="btn secondary" type="button" onClick={onMarkAllRead}>
          Mark all read
        </button>
      </div>
      <div style={{ marginTop: '0.75rem' }}>
        {notifications.length === 0 ? (
          <p className="muted">No notifications</p>
        ) : (
          notifications
            .slice(0, 10)
            .map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={onMarkRead}
              />
            ))
        )}
      </div>
    </div>
  );
}
