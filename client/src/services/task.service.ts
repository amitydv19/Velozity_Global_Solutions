import { api } from '../lib/api';
import type { Task, TaskPriority, TaskStatus } from '../types';

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  dueFrom?: string;
  dueTo?: string;
  projectId?: string;
}

export async function fetchTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const { data } = await api.get('/tasks', { params: filters });
  return (data.data as { tasks: Task[] }).tasks;
}

export async function createTask(input: {
  title: string;
  description?: string;
  projectId: string;
  developerId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}): Promise<Task> {
  const { data } = await api.post('/tasks', input);
  return (data.data as { task: Task }).task;
}

export async function updateTask(
  id: string,
  input: Partial<{
    title: string;
    description: string;
    developerId: string | null;
    priority: TaskPriority;
    dueDate: string | null;
  }>,
): Promise<Task> {
  const { data } = await api.patch(`/tasks/${id}`, input);
  return (data.data as { task: Task }).task;
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const { data } = await api.patch(`/tasks/${id}/status`, { status });
  return (data.data as { task: Task }).task;
}
