import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskForm } from '../components/tasks/TaskForm';
import { useRealtime } from '../context/RealtimeContext';
import { useRoleAccess } from '../hooks/useRoleAccess';
import * as projectService from '../services/project.service';
import * as taskService from '../services/task.service';
import * as userService from '../services/user.service';
import { joinProjectRoom, leaveProjectRoom } from '../services/socket.service';
import { useState } from 'react';

export function ProjectDetailPage() {
  const { id = '' } = useParams();
  const { isDeveloper } = useRoleAccess();
  const { activities } = useRealtime();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const projectQuery = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.fetchProject(id),
    enabled: Boolean(id),
  });

  const developersQuery = useQuery({
    queryKey: ['developers'],
    queryFn: userService.fetchDevelopers,
    enabled: !isDeveloper,
  });

  useEffect(() => {
    if (!id) return;
    joinProjectRoom(id);
    return () => leaveProjectRoom(id);
  }, [id]);

  if (projectQuery.isLoading) return <LoadingSpinner />;
  if (projectQuery.error || !projectQuery.data) {
    return <ErrorMessage message="Project not found or access denied" />;
  }

  const project = projectQuery.data;
  const projectActivity = activities.filter((a) => a.projectId === project.id);

  return (
    <div className="grid" style={{ gap: '1rem' }}>
      <div>
        <h1 className="page-title">{project.name}</h1>
        <p className="muted">{project.description}</p>
        {!isDeveloper ? (
          <button className="btn" type="button" onClick={() => setOpen(true)}>
            Add task
          </button>
        ) : null}
      </div>
      <div className="grid grid-2">
        <div className="grid">
          {project.tasks?.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
        <ActivityFeed items={projectActivity} title="Project activity" />
      </div>
      <Modal open={open} title="Create task" onClose={() => setOpen(false)}>
        {developersQuery.data ? (
          <TaskForm
            projects={[project]}
            developers={developersQuery.data}
            initialProjectId={project.id}
            onSubmit={async (values) => {
              await taskService.createTask(values);
              await queryClient.invalidateQueries({ queryKey: ['project', id] });
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
