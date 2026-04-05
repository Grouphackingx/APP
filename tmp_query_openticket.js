const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const u = await prisma.user.findUnique({
    where: { email: 'admin@openticket.com' },
    include: { organizerProfile: true }
  });
  console.log(JSON.stringify(u, null, 2));
}

main().finally(() => prisma.$disconnect());
