import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 12);

  await prisma.users.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password_hash: passwordHash,
      full_name: 'Administrator',
      role: 'ADMIN',
    },
  });

  await prisma.users.upsert({
    where: { username: 'operator1' },
    update: {},
    create: {
      username: 'operator1',
      password_hash: await bcrypt.hash('operator123', 12),
      full_name: 'Budi Operator',
      role: 'OPERATOR',
    },
  });

  await prisma.users.upsert({
    where: { username: 'supervisor1' },
    update: {},
    create: {
      username: 'supervisor1',
      password_hash: await bcrypt.hash('supervisor123', 12),
      full_name: 'Siti Supervisor',
      role: 'SUPERVISOR',
    },
  });

  await prisma.users.upsert({
    where: { username: 'management1' },
    update: {},
    create: {
      username: 'management1',
      password_hash: await bcrypt.hash('management123', 12),
      full_name: 'Bambang Manajemen',
      role: 'MANAGEMENT',
    },
  });

  const plant = await prisma.plants.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'PLTMH Sampean Baru',
      location: 'Bondowoso',
      capacity_kw: 1500,
      design_flow_m3s: 3.5,
      design_head_m: 20.0,
    },
  });

  await prisma.units.upsert({
    where: { id: 1 },
    update: {},
    create: {
      plant_id: plant.id,
      unit_code: 'U1',
      name: 'Unit 1',
    },
  });

  await prisma.units.upsert({
    where: { id: 2 },
    update: {},
    create: {
      plant_id: plant.id,
      unit_code: 'U2',
      name: 'Unit 2',
    },
  });

  console.log('Seed completed.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
