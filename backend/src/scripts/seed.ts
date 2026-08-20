import bcrypt from 'bcryptjs';
import { getPool, closePool } from '../config/db.js';
import * as usersRepo from '../repositories/users.js';

async function seed() {
  console.log('Seeding users...');
  await getPool();

  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const operarioPassword = process.env.SEED_OPERARIO_PASSWORD;

  if (!adminPassword || !operarioPassword) {
    throw new Error(
      'Debes definir SEED_ADMIN_PASSWORD y SEED_OPERARIO_PASSWORD antes de ejecutar el seed. ' +
      'Ejemplo: SEED_ADMIN_PASSWORD=<fuerte> SEED_OPERARIO_PASSWORD=<fuerte> npm run seed'
    );
  }

  const users = [
    { username: 'admin', password: adminPassword, name: 'Administrador', role: 'admin' as const },
    { username: 'operario1', password: operarioPassword, name: 'Carlos Martínez', role: 'user' as const },
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
