require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const categories = [
    'Design',
    'Development',
    'Marketing',
    'Writing',
    'UI/UX',
    'Frontend',
    'Backend',
    'Mobile',
    'Data Science',
    'Product Management',
    'Business',
    'Education',
    'Art',
    'Music',
    'Gaming',
    'Science',
    'Health',
    'Lifestyle',
  ];

  console.log('Seeding categories...');

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seed completed!');
  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
