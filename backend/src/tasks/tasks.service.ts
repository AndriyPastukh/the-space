import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, TaskStatusDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly authorSelect = {
    id: true,
    email: true,
    userDetails: {
      select: {
        firstName: true,
        lastName: true,
        nickname: true,
        avatarUrl: true,
      },
    },
  } as const;

  private normalizeCategoryIds(categoryIds?: number[]): number[] | undefined {
    if (!Array.isArray(categoryIds)) {
      return undefined;
    }

    return [
      ...new Set(
        categoryIds.map(Number).filter((id) => Number.isInteger(id) && id > 0),
      ),
    ];
  }

  private buildCategoriesRelation(categoryIds?: number[], replace = false) {
    const ids = this.normalizeCategoryIds(categoryIds);

    if (ids === undefined) {
      return undefined;
    }

    return {
      ...(replace ? { set: [] } : {}),
      connect: ids.map((id) => ({ id })),
    };
  }

  private buildInclude() {
    return {
      categories: true,
      author: {
        select: this.authorSelect,
      },
    };
  }

  async create(userId: number, dto: CreateTaskDto) {
    const { categories, deadline, urls, files, ...taskData } = dto;

    return this.prisma.task.create({
      data: {
        ...taskData,
        deadline: deadline ? new Date(deadline) : undefined,
        urls: urls ?? [],
        files: files ?? [],
        author: {
          connect: {
            id: userId,
          },
        },
        categories: this.buildCategoriesRelation(categories),
      },
      include: this.buildInclude(),
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: TaskStatusDto;
    search?: string;
    authorId?: number;
    categories?: number[];
  }) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      authorId,
      categories,
    } = query;

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 100);
    const skip = (safePage - 1) * safeLimit;

    const where: any = {
      deletedAt: null,
    };

    const normalizedSearch = search?.trim();

    if (normalizedSearch) {
      where.OR = [
        {
          title: {
            contains: normalizedSearch,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: normalizedSearch,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (authorId && Number.isInteger(authorId)) {
      where.authorId = authorId;
    }

    if (categories && categories.length > 0) {
      where.categories = {
        some: {
          id: {
            in: categories,
          },
        },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: {
          createdAt: 'desc',
        },
        include: this.buildInclude(),
      }),
      this.prisma.task.count({
        where,
      }),
    ]);

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: {
        id,
      },
      include: this.buildInclude(),
    });

    if (!task || task.deletedAt) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, userId: number, dto: UpdateTaskDto) {
    const task = await this.findOne(id);

    if (task.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own tasks');
    }

    const { categories, deadline, urls, files, ...updateData } = dto;

    return this.prisma.task.update({
      where: {
        id,
      },
      data: {
        ...updateData,

        deadline:
          deadline !== undefined
            ? deadline
              ? new Date(deadline)
              : null
            : undefined,

        urls: urls !== undefined ? urls : undefined,
        files: files !== undefined ? files : undefined,

        categories: this.buildCategoriesRelation(categories, true),
      },
      include: this.buildInclude(),
    });
  }

  async remove(id: string, userId: number) {
    const task = await this.findOne(id);

    if (task.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own tasks');
    }

    return this.prisma.task.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
