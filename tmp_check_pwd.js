const { PrismaClient } = require('./node_modules/@prisma/client');
const bcrypt = require('./node_modules/bcrypt');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'dmxwilly@gmail.com' } });
  if (!user) {
    console.log('User not found!');
    return;
  }
  console.log('Found user:', { id: user.id, email: user.email, role: user.role, name: user.name });
  console.log('Password hash:', user.password);
  
  // Test some common passwords
  const testPasswords = ['password123', '123456', 'admin123', 'dmxwilly', 'willy123'];
  for (const pwd of testPasswords) {
    const match = await bcrypt.compare(pwd, user.password);
    if (match) {
      console.log('Password match found:', pwd);
    }
  }
  console.log('Done checking passwords');
}

main().finally(() => prisma.$disconnect());
