import type { TaskStatus } from '../../types';

const statusConfig: Record<
  TaskStatus,
  { label: string; bg: string; color: string; border: string; dot: string }
> = {
  TODO: {
    label: 'Todo',
    bg: '#f1f5f9',
    color: '#475569',
    border: '#cbd5e1',
    dot: '#94a3b8',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: '#eff6ff',
    color: '#1d4ed8',
    border: '#bfdbfe',
    dot: '#3b82f6',
  },
  IN_REVIEW: {
    label: 'In Review',
    bg: '#f5f3ff',
    color: '#6d28d9',
    border: '#ddd6fe',
    dot: '#8b5cf6',
  },
  DONE: {
    label: 'Done',
    bg: '#f0fdf4',
    color: '#166534',
    border: '#bbf7d0',
    dot: '#22c55e',
  },
  OVERDUE: {
    label: 'Overdue',
    bg: '#fff1f2',
    color: '#be123c',
    border: '#fecdd3',
    dot: '#f43f5e',
  },
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const cfg = statusConfig[status] ?? statusConfig.TODO;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.3rem 0.75rem',
        borderRadius: '2rem',
        fontSize: '0.78rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        color: cfg.color,
        background: cfg.bg,
        border: `1.5px solid ${cfg.border}`,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}
