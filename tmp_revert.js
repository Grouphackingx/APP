const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'dmxwilly@gmail.com' } });
  
  if (user) {
    // Delete the organizer profile if it exists
    await prisma.organizerProfile.deleteMany({
      where: { userId: user.id }
    });

    // Update role back to USER
    await prisma.user.update({
      where: { email: 'dmxwilly@gmail.com' },
      data: { role: 'USER' }
    });
    console.log('Reverted dmxwilly to USER');
  }
}

main().finally(() => prisma.$disconnect());
