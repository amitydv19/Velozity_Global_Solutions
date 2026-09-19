import type { Notification } from '../../types';
import { formatDateTime } from '../../utils/format';

export function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead?: (id: string) => void;
}) {
  return (
    <div
      style={{
        padding: '0.65rem 0',
        borderBottom: '1px solid #e2e8f0',
        opacity: notification.isRead ? 0.7 : 1,
      }}
    >
      <div>{notification.message}</div>
      <div className="muted" style={{ fontSize: '0.85rem' }}>
        {formatDateTime(notification.createdAt)}
      </div>
      {!notification.isRead && onRead ? (
        <button
          className="btn secondary"
          type="button"
          style={{ marginTop: '0.35rem' }}
          onClick={() => onRead(notification.id)}
        >
          Mark read
        </button>
      ) : null}
    </div>
  );
}
