const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const user = await prisma.user.findUnique({ where: { email: 'grouphackingx@gmail.com' } });
  console.log("User:", user);
}
run();
