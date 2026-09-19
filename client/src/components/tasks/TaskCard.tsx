import type { Task, TaskStatus } from '../../types';
import { formatDate } from '../../utils/format';
import { TaskStatusBadge } from './TaskStatusBadge';

export function TaskCard({
  task,
  onStatusChange,
  canUpdateStatus,
}: {
  task: Task;
  canUpdateStatus?: boolean;
  onStatusChange?: (status: TaskStatus) => void;
}) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.35rem' }}>{task.title}</h3>
          <p className="muted" style={{ margin: 0 }}>
            {task.project?.name ?? 'Project'} · {task.priority} · Due {formatDate(task.dueDate)}
          </p>
        </div>
        <TaskStatusBadge status={task.status} />
      </div>
      {canUpdateStatus && onStatusChange ? (
        <div style={{ marginTop: '0.75rem' }}>
          <label className="muted" htmlFor={`status-${task.id}`}>
            Update status
          </label>
          <select
            id={`status-${task.id}`}
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
          >
            {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'OVERDUE'] as TaskStatus[]).map(
              (status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ),
            )}
          </select>
        </div>
      ) : null}
    </div>
  );
}
