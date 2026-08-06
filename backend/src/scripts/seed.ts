import bcrypt from 'bcryptjs';
import { getPool, closePool } from '../config/db.js';
import * as usersRepo from '../repositories/users.js';

async function seed() {
  console.log('Seeding users...');
  await getPool();

  const users = [
    { username: 'admin', password: process.env.SEED_ADMIN_PASSWORD ?? '__SEED_ADMIN_PASSWORD__', name: 'Administrador', role: 'admin' as const },
    { username: 'operario1', password: process.env.SEED_OPERARIO_PASSWORD ?? '__SEED_OPERARIO_PASSWORD__', name: 'Carlos Martínez', role: 'user' as const },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await usersRepo.upsertUser(u.username, hash, u.name, u.role);
    console.log(`  ✓ ${u.username} (${u.role})`);
  }

  await closePool();
  console.log('Seed completed.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
