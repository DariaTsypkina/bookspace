import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertUser(email: string, password: string, role: UserRole) {
  const passwordHash = await hash(password, 10);
  const slug = email
    .split('@')[0]!
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role, slug },
    create: { email, passwordHash, role, slug },
  });
}

async function main() {
  await upsertUser('admin@bookspace.local', 'Admin123!', UserRole.ADMIN);
  await upsertUser('user@bookspace.local', 'User123!', UserRole.USER);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
