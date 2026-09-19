import { prisma } from '../config/prisma.js';
import { NotFoundError } from '../utils/errors.js';

export async function listClients() {
  return prisma.client.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { projects: true } } },
  });
}

export async function getClient(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: { projects: true },
  });
  if (!client) {
    throw new NotFoundError('Client not found');
  }
  return client;
}

export async function createClient(data: {
  name: string;
  email?: string | null;
  company?: string | null;
}) {
  return prisma.client.create({ data });
}

export async function updateClient(
  id: string,
  data: Partial<{ name: string; email: string | null; company: string | null }>,
) {
  await getClient(id);
  return prisma.client.update({ where: { id }, data });
}

export async function deleteClient(id: string) {
  await getClient(id);
  return prisma.client.delete({ where: { id } });
}
