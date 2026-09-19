import { Link } from 'react-router-dom';
import type { Project } from '../../types';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/projects/${project.id}`} className="card" style={{ display: 'block' }}>
      <h3 style={{ marginTop: 0 }}>{project.name}</h3>
      <p className="muted" style={{ marginBottom: 0 }}>
        {project.client?.name ?? 'Client'} · {project._count?.tasks ?? project.tasks?.length ?? 0}{' '}
        tasks
      </p>
    </Link>
  );
}
