const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update admin to HOST role
  await prisma.user.update({
    where: { email: 'admin@openticket.com' },
    data: { role: 'HOST' },
  });

  // Update staff to STAFF role
  await prisma.user.update({
    where: { email: 'staff@openticket.com' },
    data: { role: 'STAFF' },
  });

  // Verify
  const users = await prisma.user.findMany({
    select: { email: true, role: true, name: true },
  });
  console.log('Users after role update:');
  console.log(JSON.stringify(users, null, 2));

  await prisma['$disconnect']();
}

main().catch(console.error);
