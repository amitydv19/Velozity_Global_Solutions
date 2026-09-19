import { useState } from 'react';
import type { Project, TaskPriority, TaskStatus, User } from '../../types';

export function TaskForm({
  projects,
  developers,
  initialProjectId,
  onSubmit,
}: {
  projects: Project[];
  developers: User[];
  initialProjectId?: string;
  onSubmit: (values: {
    title: string;
    description?: string;
    projectId: string;
    developerId?: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(initialProjectId ?? projects[0]?.id ?? '');
  const [developerId, setDeveloperId] = useState(developers[0]?.id ?? '');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setLoading(true);
        void onSubmit({
          title,
          description,
          projectId,
          developerId: developerId || undefined,
          priority,
          status,
          dueDate: dueDate || undefined,
        }).finally(() => setLoading(false));
      }}
    >
      <label className="form-field">
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label className="form-field">
        Description
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </label>
      <label className="form-field">
        Project
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field">
        Developer
        <select value={developerId} onChange={(e) => setDeveloperId(e.target.value)}>
          <option value="">Unassigned</option>
          {developers.map((dev) => (
            <option key={dev.id} value={dev.id}>
              {dev.name}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field">
        Priority
        <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
          {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as TaskPriority[]).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field">
        Status
        <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
          {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as TaskStatus[]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field">
        Due date
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </label>
      <button className="btn" type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save task'}
      </button>
    </form>
  );
}
