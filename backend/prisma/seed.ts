import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
