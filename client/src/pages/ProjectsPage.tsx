import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectForm } from '../components/projects/ProjectForm';
import { useRoleAccess } from '../hooks/useRoleAccess';
import * as clientService from '../services/client.service';
import * as projectService from '../services/project.service';

export function ProjectsPage() {
  const { isDeveloper } = useRoleAccess();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: projectService.fetchProjects });
  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: clientService.fetchClients,
    enabled: !isDeveloper,
  });

  if (isDeveloper) {
    return <ErrorMessage message="Developers cannot access the projects list." />;
  }

  if (projectsQuery.isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Projects</h1>
        <button className="btn" type="button" onClick={() => setOpen(true)}>
          New project
        </button>
      </div>
      {projectsQuery.error ? <ErrorMessage message="Failed to load projects" /> : null}
      <div className="grid grid-3">
        {projectsQuery.data?.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      <Modal open={open} title="Create project" onClose={() => setOpen(false)}>
        {clientsQuery.data ? (
          <ProjectForm
            clients={clientsQuery.data}
            onSubmit={async (values) => {
              await projectService.createProject(values);
              await queryClient.invalidateQueries({ queryKey: ['projects'] });
              setOpen(false);
            }}
          />
        ) : (
          <LoadingSpinner label="Loading clients..." />
        )}
      </Modal>
    </div>
  );
}
