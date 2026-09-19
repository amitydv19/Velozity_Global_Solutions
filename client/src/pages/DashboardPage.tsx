import { useQuery } from '@tanstack/react-query';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StatsCard } from '../components/dashboard/StatsCard';
import { ProjectCard } from '../components/projects/ProjectCard';
import { TaskCard } from '../components/tasks/TaskCard';
import { useRealtime } from '../context/RealtimeContext';
import { useRoleAccess } from '../hooks/useRoleAccess';
import * as dashboardService from '../services/dashboard.service';
import type { AdminStats, DevStats, PmStats } from '../services/dashboard.service';

export function DashboardPage() {
  const { isAdmin, isPm, isDeveloper } = useRoleAccess();
  const { activities, onlineUsers } = useRealtime();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.fetchDashboard,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load dashboard" />;

  const feed = activities.length ? activities : (data?.activity ?? []);

  if (isAdmin && data) {
    const stats = data.stats as AdminStats;
    return (
      <div className="grid" style={{ gap: '1rem' }}>
        <h1 className="page-title">Admin Dashboard</h1>
        <div className="grid grid-4">
          <StatsCard label="Total projects" value={stats.totalProjects} />
          <StatsCard label="Total tasks" value={stats.totalTasks} />
          <StatsCard label="Overdue tasks" value={stats.overdueCount} />
          <StatsCard label="Online users" value={onlineUsers || stats.onlineUsers} />
        </div>
        <div className="grid grid-2">
          <div className="card">
            <h3>Tasks by status</h3>
            {Object.entries(stats.tasksByStatus ?? {}).map(([status, count]) => (
              <div key={status}>
                {status}: {count}
              </div>
            ))}
          </div>
          <ActivityFeed items={feed} title="Global activity feed" />
        </div>
      </div>
    );
  }

  if (isPm && data) {
    const stats = data.stats as PmStats;
    return (
      <div className="grid" style={{ gap: '1rem' }}>
        <h1 className="page-title">Project Manager Dashboard</h1>
        <div className="grid grid-4">
          <StatsCard label="Projects" value={stats.projects?.length ?? 0} />
          <StatsCard label="Total tasks" value={stats.taskSummary?.total ?? 0} />
          <StatsCard label="In progress" value={stats.taskSummary?.inProgress ?? 0} />
          <StatsCard label="Overdue" value={stats.taskSummary?.overdue ?? 0} />
        </div>
        <div className="grid grid-2">
          <div className="grid">
            {stats.projects?.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className="grid">
            <div className="card">
              <h3>Tasks by priority</h3>
              {Object.entries(stats.tasksByPriority ?? {}).map(([priority, count]) => (
                <div key={priority}>
                  {priority}: {count}
                </div>
              ))}
            </div>
            <div className="card">
              <h3>Due this week</h3>
              {stats.upcomingDueThisWeek?.map((task) => (
                <div key={task.id}>
                  {task.title} · {task.dueDate?.slice(0, 10)}
                </div>
              ))}
            </div>
            <ActivityFeed items={feed} title="Project activity" />
          </div>
        </div>
      </div>
    );
  }

  if (isDeveloper && data) {
    const stats = data.stats as DevStats;
    return (
      <div className="grid" style={{ gap: '1rem' }}>
        <h1 className="page-title">Developer Dashboard</h1>
        <div className="grid">
          {stats.assignedTasks?.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
        <ActivityFeed items={feed} title="Task activity" />
      </div>
    );
  }

  return <ErrorMessage message="Unable to render dashboard for current role" />;
}
