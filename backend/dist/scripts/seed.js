import bcrypt from 'bcrypt';
import { getPool, closePool } from '../config/db.js';
import * as usersRepo from '../repositories/users.js';
async function seed() {
    console.log('Seeding users...');
    await getPool();
    const users = [
        { username: 'admin', password: 'admin123', name: 'Administrador', role: 'admin' },
        { username: 'operario1', password: 'op123', name: 'Carlos Martínez', role: 'user' },
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
