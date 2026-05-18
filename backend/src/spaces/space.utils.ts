import { PrismaClient } from '@prisma/client';

export async function generateSlug(
  name: string,
  model: 'community' | 'team',
  prisma: PrismaClient,
): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters (except spaces and hyphens)
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing =
      model === 'community'
        ? await prisma.community.findUnique({ where: { slug } })
        : await prisma.team.findUnique({ where: { slug } });

    if (!existing) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}
