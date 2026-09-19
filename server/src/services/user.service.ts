import { UserRole } from '../config/enums.js';
import { prisma } from '../config/prisma.js';
import { NotFoundError } from '../utils/errors.js';
import { hashPassword } from './auth.service.js';

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
}

export async function listDevelopers() {
  return prisma.user.findMany({
    where: { role: UserRole.DEVELOPER },
    orderBy: { name: 'asc' },
    select: { id: true, email: true, name: true, role: true },
  });
}

export async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}) {
  const passwordHash = await hashPassword(data.password);
  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
}

export async function updateUser(
  id: string,
  data: Partial<{ email: string; password: string; name: string; role: UserRole }>,
) {
  await getUser(id);
  const updateData: {
    email?: string;
    name?: string;
    role?: UserRole;
    passwordHash?: string;
  } = {};
  if (data.email) updateData.email = data.email;
  if (data.name) updateData.name = data.name;
  if (data.role) updateData.role = data.role;
  if (data.password) {
    updateData.passwordHash = await hashPassword(data.password);
  }
  return prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
}

export async function deleteUser(id: string) {
  await getUser(id);
  return prisma.user.delete({
    where: { id },
    select: { id: true },
  });
}
