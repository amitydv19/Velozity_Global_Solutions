export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'OVERDUE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Client {
  id: string;
  name: string;
  email?: string | null;
  company?: string | null;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  clientId: string;
  managerId: string;
  client?: Client;
  manager?: Pick<User, 'id' | 'name' | 'email'>;
  tasks?: Task[];
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  projectId: string;
  developerId?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  project?: Pick<Project, 'id' | 'name' | 'managerId'>;
  developer?: Pick<User, 'id' | 'name' | 'email'> | null;
}

export interface ActivityItem {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string | null;
  oldStatus?: TaskStatus | null;
  newStatus?: TaskStatus | null;
  message?: string | null;
  createdAt: string;
  user?: Pick<User, 'id' | 'name' | 'role'>;
  task?: Pick<Task, 'id' | 'title'>;
  project?: Pick<Project, 'id' | 'name'>;
}

export interface Notification {
  id: string;
  recipientId: string;
  taskId?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
  task?: Pick<Task, 'id' | 'title' | 'projectId'>;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string };
}
