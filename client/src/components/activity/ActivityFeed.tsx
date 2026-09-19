import type { ActivityItem as ActivityItemType } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { ActivityItem } from './ActivityItem';

export function ActivityFeed({
  items,
  title = 'Activity',
}: {
  items: ActivityItemType[];
  title?: string;
}) {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {items.length === 0 ? (
        <EmptyState title="No activity yet" description="Updates will appear here in real time." />
      ) : (
        items.map((item) => <ActivityItem key={item.id} item={item} />)
      )}
    </div>
  );
}
