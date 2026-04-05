const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hosts = await prisma.user.findMany({
    where: { 
      role: 'HOST',
      organizerProfile: null
    }
  });

  for (const h of hosts) {
    await prisma.user.update({
      where: { id: h.id },
      data: {
        organizerProfile: {
          create: {
            organizationName: h.name || 'Sin Nombre Organizacion',
            firstName: 'Representante',
            lastName: 'Desconocido',
            identificationNumber: '9999999999',
            phone: '---',
            plan: 'FREE',
            status: 'APPROVED',
            address: '---',
            province: '---',
            city: '---'
          }
        }
      }
    });
    console.log(`Created missing profile for ${h.email}`);
  }
}

main().finally(() => prisma.$disconnect());
