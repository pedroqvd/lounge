const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const usersToSeed = [
    { email: 'gerciane@lounge.com', name: 'gerciane', role: 'LIDER' },
    { email: 'cheni@lounge.com', name: 'cheni', role: 'ADMIN' },
    { email: 'sistema@loungeforyou.com', name: 'Sistema', role: 'ADMIN' }
  ];

  for (const u of usersToSeed) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, name: u.name },
      create: { email: u.email, name: u.name, role: u.role }
    });
  }
  console.log('Usuarios inseridos com sucesso!');
}
seed().catch(console.error).finally(() => prisma.$disconnect());
