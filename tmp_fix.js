const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { email: 'dmxwilly@gmail.com' },
    data: { 
      role: 'HOST',
      organizerProfile: {
        create: {
          organizationName: 'OpenTicket Demo (Willy)',
          firstName: 'Marcelo',
          lastName: 'Admin',
          identificationNumber: '0000000000',
          phone: '+593999999999',
          plan: 'ELITE',
          status: 'PENDING', // Pongo pending para que lo pueda probar aprobándolo manual
        }
      }
    }
  });
  console.log('Done fixing dmxwilly');
}
main().finally(() => prisma.$disconnect());
