import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: {
        category: 'asc',
      },
      select: {
        id: true,
        category: true,
      },
    });

    return categories;
  }
}
