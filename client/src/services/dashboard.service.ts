import { api } from '../lib/api';
import type { ActivityItem, Project, Task, UserRole } from '../types';

export interface DashboardResponse {
  role: UserRole;
  stats: Record<string, unknown>;
  activity: ActivityItem[];
}

export async function fetchDashboard(): Promise<DashboardResponse> {
  const { data } = await api.get('/dashboard');
  return data.data as DashboardResponse;
}

export type AdminStats = {
  totalProjects: number;
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  overdueCount: number;
  onlineUsers: number;
};

export type PmStats = {
  projects: Project[];
  taskSummary: Record<string, number>;
  tasksByPriority: Record<string, number>;
  upcomingDueThisWeek: Task[];
};

export type DevStats = {
  assignedTasks: Task[];
};
