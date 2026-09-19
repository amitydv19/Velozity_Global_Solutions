import type { TaskFilters as TaskFiltersType } from '../../services/task.service';
import type { TaskPriority, TaskStatus } from '../../types';

export function TaskFilters({
  value,
  onChange,
}: {
  value: TaskFiltersType;
  onChange: (next: TaskFiltersType) => void;
}) {
  return (
    <div className="card grid grid-4">
      <label className="form-field" style={{ margin: 0 }}>
        Status
        <select
          value={value.status ?? ''}
          onChange={(e) =>
            onChange({ ...value, status: (e.target.value || undefined) as TaskStatus | undefined })
          }
        >
          <option value="">All</option>
          {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'OVERDUE'] as TaskStatus[]).map(
            (status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ),
          )}
        </select>
      </label>
      <label className="form-field" style={{ margin: 0 }}>
        Priority
        <select
          value={value.priority ?? ''}
          onChange={(e) =>
            onChange({
              ...value,
              priority: (e.target.value || undefined) as TaskPriority | undefined,
            })
          }
        >
          <option value="">All</option>
          {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as TaskPriority[]).map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field" style={{ margin: 0 }}>
        Due from
        <input
          type="date"
          value={value.dueFrom ?? ''}
          onChange={(e) => onChange({ ...value, dueFrom: e.target.value || undefined })}
        />
      </label>
      <label className="form-field" style={{ margin: 0 }}>
        Due to
        <input
          type="date"
          value={value.dueTo ?? ''}
          onChange={(e) => onChange({ ...value, dueTo: e.target.value || undefined })}
        />
      </label>
    </div>
  );
}
