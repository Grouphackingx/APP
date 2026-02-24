const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({
    where: { city: null },
  });

  console.log(`Updating ${events.length} events with null city to 'Quito'`);

  for (const event of events) {
    await prisma.event.update({
      where: { id: event.id },
      data: { city: 'Quito' },
    });
  }

  const updatedEvents = await prisma.event.findMany({
    select: { title: true, location: true, city: true },
  });

  console.log(updatedEvents);

  await prisma['$disconnect']();
}

main().catch(console.error);
