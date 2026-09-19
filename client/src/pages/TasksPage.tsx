import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskForm } from '../components/tasks/TaskForm';
import { useRoleAccess } from '../hooks/useRoleAccess';
import * as projectService from '../services/project.service';
import * as taskService from '../services/task.service';
import type { TaskFilters as TaskFiltersType } from '../services/task.service';
import * as userService from '../services/user.service';
import type { TaskStatus } from '../types';

export function TasksPage() {
  const { isDeveloper, isPm, isAdmin } = useRoleAccess();
  const [filters, setFilters] = useState<TaskFiltersType>({});
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskService.fetchTasks(filters),
  });

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.fetchProjects,
    enabled: isAdmin || isPm,
  });

  const developersQuery = useQuery({
    queryKey: ['developers'],
    queryFn: userService.fetchDevelopers,
    enabled: isAdmin || isPm,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      taskService.updateTaskStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return (
    <div className="grid" style={{ gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Tasks</h1>
        {(isAdmin || isPm) && (
          <button className="btn" type="button" onClick={() => setOpen(true)}>
            New task
          </button>
        )}
      </div>
      <TaskFilters value={filters} onChange={setFilters} />
      {tasksQuery.isLoading ? <LoadingSpinner /> : null}
      {tasksQuery.error ? <ErrorMessage message="Failed to load tasks" /> : null}
      <div className="grid">
        {tasksQuery.data?.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            canUpdateStatus={isDeveloper}
            onStatusChange={(status) => statusMutation.mutate({ id: task.id, status })}
          />
        ))}
      </div>
      <Modal open={open} title="Create task" onClose={() => setOpen(false)}>
        {projectsQuery.data && developersQuery.data ? (
          <TaskForm
            projects={projectsQuery.data}
            developers={developersQuery.data}
            onSubmit={async (values) => {
              await taskService.createTask(values);
              await queryClient.invalidateQueries({ queryKey: ['tasks'] });
              setOpen(false);
            }}
          />
        ) : (
          <LoadingSpinner />
        )}
      </Modal>
    </div>
  );
}
