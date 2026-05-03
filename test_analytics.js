const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const organizers = await prisma.user.findMany({
      where: { role: 'HOST' },
      include: {
        organizerProfile: true,
        eventsOwned: {
          include: {
            zones: {
              include: {
                seats: {
                  where: { isSold: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log("Organizers length:", organizers.length);
    console.log(organizers[0]);
  } catch(e) { console.error(e); }
  await prisma.$disconnect();
}
run();
