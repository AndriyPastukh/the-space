import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { UpdateKnowledgeDto } from './dto/update-knowledge.dto';

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateKnowledgeDto) {
    const { offerCategories, requestCategories, deadline, ...data } = dto;

    return this.prisma.knowledge.create({
      data: {
        ...data,
        deadline: new Date(deadline),
        authorId: userId,
        offerCategories: {
          connect: offerCategories.map((id) => ({ id })),
        },
        requestCategories: {
          connect: requestCategories.map((id) => ({ id })),
        },
      },
      include: {
        offerCategories: true,
        requestCategories: true,
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    offerCat?: number[];
    requestCat?: number[];
  }) {
    const { page = 1, limit = 10, search, offerCat, requestCat } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { deletedAt: null };

    const normalizedSearch = search?.trim();

    if (normalizedSearch) {
      where.OR = [
        {
          offerDescription: {
            contains: normalizedSearch,
            mode: 'insensitive',
          },
        },
        {
          requestDescription: {
            contains: normalizedSearch,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (offerCat && offerCat.length > 0) {
      where.offerCategories = { some: { id: { in: offerCat } } };
    }

    if (requestCat && requestCat.length > 0) {
      where.requestCategories = { some: { id: { in: requestCat } } };
    }

    const [items, total] = await Promise.all([
      this.prisma.knowledge.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              userDetails: {
                select: { firstName: true, nickname: true, avatarUrl: true },
              },
            },
          },
          offerCategories: true,
          requestCategories: true,
        },
      }),
      this.prisma.knowledge.count({ where }),
    ]);

    return {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.knowledge.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            userDetails: {
              select: {
                firstName: true,
                lastName: true,
                nickname: true,
                avatarUrl: true,
              },
            },
          },
        },
        offerCategories: true,
        requestCategories: true,
      },
    });

    if (!item || item.deletedAt) {
      throw new NotFoundException('Knowledge entry not found');
    }
    return item;
  }

  async update(id: string, userId: number, dto: UpdateKnowledgeDto) {
    const item = await this.findOne(id);
    if (item.authorId !== userId) {
      throw new ForbiddenException(
        'You can only edit your own knowledge entries',
      );
    }

    const { offerCategories, requestCategories, deadline, ...data } = dto;

    return this.prisma.knowledge.update({
      where: { id },
      data: {
        ...data,
        deadline: deadline !== undefined ? new Date(deadline) : undefined,
        offerCategories: offerCategories
          ? {
              set: [],
              connect: offerCategories.map((id) => ({ id })),
            }
          : undefined,
        requestCategories: requestCategories
          ? {
              set: [],
              connect: requestCategories.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        offerCategories: true,
        requestCategories: true,
      },
    });
  }

  async remove(id: string, userId: number) {
    const item = await this.findOne(id);
    if (item.authorId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own knowledge entries',
      );
    }

    return this.prisma.knowledge.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
