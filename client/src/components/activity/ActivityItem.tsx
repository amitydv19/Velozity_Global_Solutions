import type { ActivityItem as ActivityItemType } from '../../types';
import { formatDateTime } from '../../utils/format';

export function ActivityItem({ item }: { item: ActivityItemType }) {
  return (
    <div style={{ padding: '0.65rem 0', borderBottom: '1px solid #e2e8f0' }}>
      <strong>{item.user?.name ?? 'User'}</strong>{' '}
      <span className="muted">
        {item.message ??
          (item.oldStatus && item.newStatus
            ? `${item.oldStatus} → ${item.newStatus}`
            : 'Activity update')}
      </span>
      <div className="muted" style={{ fontSize: '0.85rem' }}>
        {item.project?.name ?? 'Project'}
        {item.task?.title ? ` · ${item.task.title}` : ''} · {formatDateTime(item.createdAt)}
      </div>
    </div>
  );
}
