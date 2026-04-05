const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany({ where: { role: 'HOST' }, include: { organizerProfile: true } }).then(u => console.dir(u, {depth:null})).finally(() => prisma.$disconnect());
