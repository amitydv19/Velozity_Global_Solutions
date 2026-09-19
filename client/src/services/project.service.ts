import { api } from '../lib/api';
import type { Project } from '../types';

export async function fetchProjects(): Promise<Project[]> {
  const { data } = await api.get('/projects');
  return (data.data as { projects: Project[] }).projects;
}

export async function fetchProject(id: string): Promise<Project> {
  const { data } = await api.get(`/projects/${id}`);
  return (data.data as { project: Project }).project;
}

export async function createProject(input: {
  name: string;
  description?: string;
  clientId: string;
  managerId?: string;
}): Promise<Project> {
  const { data } = await api.post('/projects', input);
  return (data.data as { project: Project }).project;
}

export async function updateProject(
  id: string,
  input: Partial<{ name: string; description: string; clientId: string }>,
): Promise<Project> {
  const { data } = await api.patch(`/projects/${id}`, input);
  return (data.data as { project: Project }).project;
}
