const jwt = require('jsonwebtoken'); // Need to install? Let's just use Prisma directly to bypass network if we trust it... Wait, I want to test the network.
const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const payload = { sub: admin.id, email: admin.email, role: admin.role };
  const token = jwt.sign(payload, 'superSecretKey123', { expiresIn: '1h' });

  const res = await fetch('http://localhost:3000/api/admin/organizers', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const body = await res.text();
  console.log('Status:', res.status);
  console.log('Body length:', body.length);
  if (body.length < 200) console.log(body);
}

main().catch(console.error);
