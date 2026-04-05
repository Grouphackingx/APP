const { PrismaClient } = require('./node_modules/@prisma/client');
const bcrypt = require('./node_modules/bcrypt');
const prisma = new PrismaClient();

async function main() {
  const newPassword = 'willy2024';
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email: 'dmxwilly@gmail.com' },
    data: { password: hashed }
  });
  console.log(`Password reset for dmxwilly@gmail.com -> new password: ${newPassword}`);
}

main().finally(() => prisma.$disconnect());
