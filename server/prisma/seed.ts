import { PrismaClient } from '@prisma/client';

// String literals matching schema comments (SQLite has no enums)
const UserRole = { ADMIN: 'ADMIN', PROJECT_MANAGER: 'PROJECT_MANAGER', DEVELOPER: 'DEVELOPER' } as const;
const TaskStatus = { TODO: 'TODO', IN_PROGRESS: 'IN_PROGRESS', IN_REVIEW: 'IN_REVIEW', DONE: 'DONE', OVERDUE: 'OVERDUE' } as const;
const TaskPriority = { LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH', CRITICAL: 'CRITICAL' } as const;
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PASSWORD = 'Password123!';

async function main() {
  await prisma.notification.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@dashboard.local',
      name: 'Alex Admin',
      role: UserRole.ADMIN,
      passwordHash,
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      email: 'pm1@dashboard.local',
      name: 'Morgan PM',
      role: UserRole.PROJECT_MANAGER,
      passwordHash,
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      email: 'pm2@dashboard.local',
      name: 'Jordan PM',
      role: UserRole.PROJECT_MANAGER,
      passwordHash,
    },
  });

  const developers = await Promise.all(
    [
      { email: 'dev1@dashboard.local', name: 'Sam Developer' },
      { email: 'dev2@dashboard.local', name: 'Riley Developer' },
      { email: 'dev3@dashboard.local', name: 'Casey Developer' },
      { email: 'dev4@dashboard.local', name: 'Taylor Developer' },
    ].map((dev) =>
      prisma.user.create({
        data: {
          ...dev,
          role: UserRole.DEVELOPER,
          passwordHash,
        },
      }),
    ),
  );

  const clients = await Promise.all([
    prisma.client.create({
      data: { name: 'Acme Corp', email: 'contact@acme.example', company: 'Acme Corp' },
    }),
    prisma.client.create({
      data: { name: 'Globex Industries', email: 'hello@globex.example', company: 'Globex' },
    }),
    prisma.client.create({
      data: { name: 'Initech', email: 'projects@initech.example', company: 'Initech' },
    }),
  ]);

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Acme Portal Redesign',
        description: 'Modernize customer portal UX and performance.',
        clientId: clients[0].id,
        managerId: pm1.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Globex Mobile App',
        description: 'Cross-platform mobile experience for field teams.',
        clientId: clients[1].id,
        managerId: pm1.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Initech Analytics',
        description: 'Executive dashboards and reporting pipeline.',
        clientId: clients[2].id,
        managerId: pm2.id,
      },
    }),
  ]);

  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
  const daysAhead = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

  const taskTemplates: Array<{
    projectIndex: number;
    title: string;
    developerIndex: number;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date;
  }> = [
    {
      projectIndex: 0,
      title: 'Audit legacy components',
      developerIndex: 0,
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      dueDate: daysAgo(10),
    },
    {
      projectIndex: 0,
      title: 'Design system tokens',
      developerIndex: 1,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      dueDate: daysAhead(2),
    },
    {
      projectIndex: 0,
      title: 'Implement auth screens',
      developerIndex: 0,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: daysAhead(5),
    },
    {
      projectIndex: 0,
      title: 'Optimize bundle size',
      developerIndex: 2,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: daysAhead(8),
    },
    {
      projectIndex: 0,
      title: 'Fix overdue checkout bug',
      developerIndex: 3,
      status: TaskStatus.OVERDUE,
      priority: TaskPriority.CRITICAL,
      dueDate: daysAgo(3),
    },
    {
      projectIndex: 0,
      title: 'Accessibility remediation',
      developerIndex: 1,
      status: TaskStatus.OVERDUE,
      priority: TaskPriority.HIGH,
      dueDate: daysAgo(1),
    },
    {
      projectIndex: 1,
      title: 'Setup React Native shell',
      developerIndex: 2,
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      dueDate: daysAgo(5),
    },
    {
      projectIndex: 1,
      title: 'Offline sync prototype',
      developerIndex: 3,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      dueDate: daysAhead(3),
    },
    {
      projectIndex: 1,
      title: 'Push notifications',
      developerIndex: 0,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: daysAhead(10),
    },
    {
      projectIndex: 1,
      title: 'Device QA matrix',
      developerIndex: 1,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.MEDIUM,
      dueDate: daysAhead(1),
    },
    {
      projectIndex: 1,
      title: 'Crash reporting integration',
      developerIndex: 2,
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: daysAhead(14),
    },
    {
      projectIndex: 2,
      title: 'ETL pipeline setup',
      developerIndex: 0,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: daysAhead(4),
    },
    {
      projectIndex: 2,
      title: 'KPI definitions workshop',
      developerIndex: 1,
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      dueDate: daysAgo(2),
    },
    {
      projectIndex: 2,
      title: 'Chart library evaluation',
      developerIndex: 3,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: daysAhead(6),
    },
    {
      projectIndex: 2,
      title: 'Role-based report access',
      developerIndex: 2,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      dueDate: daysAhead(2),
    },
    {
      projectIndex: 2,
      title: 'Legacy data migration',
      developerIndex: 0,
      status: TaskStatus.OVERDUE,
      priority: TaskPriority.CRITICAL,
      dueDate: daysAgo(4),
    },
  ];

  for (const template of taskTemplates) {
    const project = projects[template.projectIndex];
    const developer = developers[template.developerIndex];

    const task = await prisma.task.create({
      data: {
        title: template.title,
        description: `Seed task for ${project.name}`,
        projectId: project.id,
        developerId: developer.id,
        status: template.status,
        priority: template.priority,
        dueDate: template.dueDate,
      },
    });

    await prisma.activity.create({
      data: {
        userId: developer.id,
        projectId: project.id,
        taskId: task.id,
        oldStatus: TaskStatus.TODO,
        newStatus: template.status,
        message: `Initial seeded status ${template.status}`,
        createdAt: daysAgo(2),
      },
    });
  }

  await prisma.notification.create({
    data: {
      recipientId: developers[0].id,
      message: 'Welcome! You have assigned tasks waiting.',
    },
  });

  console.log('Seed completed.');
  console.log('Test password for all users:', PASSWORD);
  console.log('Admin:', admin.email);
  console.log('PMs:', pm1.email, pm2.email);
  console.log('Developers:', developers.map((d) => d.email).join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
