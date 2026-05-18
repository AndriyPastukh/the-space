import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JoinRequestStatus, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, TaskStatusDto } from './dto/create-task.dto';
import { TaskProposalDecisionDto } from './dto/respond-to-proposal.dto';
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
      assignee: {
        select: this.authorSelect,
      },
      reviews: {
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
              nickname: true,
              avatarUrl: true,
            },
          },
        },
      },
      proposals: {
        include: {
          userDetails: {
            select: {
              firstName: true,
              lastName: true,
              nickname: true,
              avatarUrl: true,
              reputation: true,
            },
          },
        },
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
    assigneeId?: number;
    categories?: number[];
  }) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      authorId,
      assigneeId,
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

    if (assigneeId && Number.isInteger(assigneeId)) {
      where.assigneeId = assigneeId;
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

  async applyToTask(id: string, userId: number, message?: string) {
    const task = await this.findOne(id);

    if (task.authorId === userId) {
      throw new ForbiddenException('You cannot apply to your own task');
    }

    if (task.status !== TaskStatus.OPEN || task.assigneeId) {
      throw new BadRequestException(
        'This task is no longer accepting applications',
      );
    }

    const userDetails = await this.prisma.userDetails.findUnique({
      where: { userId },
    });

    if (!userDetails) {
      throw new NotFoundException('User details not found');
    }

    const existingProposal = await this.prisma.taskProposal.findUnique({
      where: {
        taskId_userDetailsId: {
          taskId: id,
          userDetailsId: userDetails.id,
        },
      },
    });

    if (existingProposal) {
      throw new ForbiddenException('You have already applied to this task');
    }

    return this.prisma.taskProposal.create({
      data: {
        taskId: id,
        userDetailsId: userDetails.id,
        message,
      },
    });
  }

  async respondToProposal(
    id: string,
    userId: number,
    proposalId: string,
    status: TaskProposalDecisionDto,
  ) {
    const task = await this.findOne(id);

    if (task.authorId !== userId) {
      throw new ForbiddenException('You can only manage proposals for your own tasks');
    }

    if (task.deletedAt) {
      throw new NotFoundException('Task not found');
    }

    const proposal = await this.prisma.taskProposal.findUnique({
      where: { id: proposalId },
      include: { userDetails: true },
    });

    if (!proposal || proposal.taskId !== id) {
      throw new NotFoundException('Proposal not found');
    }

    if (proposal.userDetails.userId === task.authorId) {
      throw new ForbiddenException('You cannot assign yourself to your own task');
    }

    if (status === TaskProposalDecisionDto.APPROVED) {
      if (task.status !== TaskStatus.OPEN) {
        throw new BadRequestException(
          'Only open tasks can be assigned to an executor',
        );
      }

      if (task.assigneeId) {
        throw new BadRequestException('This task already has an assigned executor');
      }

      if (proposal.status !== JoinRequestStatus.PENDING) {
        throw new BadRequestException('Only pending proposals can be approved');
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.taskProposal.update({
          where: { id: proposalId },
          data: { status: JoinRequestStatus.APPROVED },
        });

        await tx.task.update({
          where: { id },
          data: {
            assigneeId: proposal.userDetails.userId,
            status: TaskStatus.IN_PROGRESS,
          },
        });

        await tx.taskProposal.updateMany({
          where: {
            taskId: id,
            id: { not: proposalId },
            status: JoinRequestStatus.PENDING,
          },
          data: { status: JoinRequestStatus.REJECTED },
        });
      });
    } else {
      if (task.status !== TaskStatus.OPEN || task.assigneeId) {
        throw new BadRequestException(
          'You can only reject proposals while the task is still open',
        );
      }

      if (proposal.status !== JoinRequestStatus.PENDING) {
        throw new BadRequestException('Only pending proposals can be rejected');
      }

      await this.prisma.taskProposal.update({
        where: { id: proposalId },
        data: { status: JoinRequestStatus.REJECTED },
      });
    }

    return this.findOne(id);
  }

  async findMyResponded(userId: number, query: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = query;
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 100);
    const skip = (safePage - 1) * safeLimit;

    const where: any = {
      deletedAt: null,
      assigneeId: null,
      status: TaskStatus.OPEN,
      proposals: {
        some: {
          userDetails: {
            userId: userId,
          },
          status: JoinRequestStatus.PENDING,
        },
      },
    };

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

  async completeTask(id: string, userId: number) {
    const task = await this.findOne(id);

    if (task.authorId !== userId) {
      throw new ForbiddenException('You can only complete your own tasks');
    }

    if (!task.assigneeId) {
      throw new BadRequestException('Task does not have an assigned executor');
    }

    if (task.status !== TaskStatus.IN_PROGRESS) {
      if (task.status === TaskStatus.COMPLETED) {
        throw new BadRequestException('Task is already completed');
      }
      throw new BadRequestException('Task is not in progress');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update task to COMPLETED
      const updatedTask = await tx.task.update({
        where: { id },
        data: { status: TaskStatus.COMPLETED },
      });

      // 2. Fetch assignee userDetails
      const executorDetails = await tx.userDetails.findUnique({
        where: { userId: task.assigneeId! },
      });

      if (executorDetails) {
        const link = `/tasks/${task.id}`;
        // 3. Avoid duplicate PortfolioItem for the same completed task
        const existing = await tx.portfolioItem.findFirst({
          where: {
            userDetailsId: executorDetails.id,
            link,
          },
        });

        if (!existing) {
          await tx.portfolioItem.create({
            data: {
              title: task.title,
              description: task.description || 'Завдання успішно виконано!',
              link,
              userDetailsId: executorDetails.id,
            },
          });
        }
      }

      return updatedTask;
    });
  }

  async createReview(
    id: string,
    userId: number,
    dto: { rating: number; comment?: string },
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        author: { include: { userDetails: true } },
        assignee: { include: { userDetails: true } },
      },
    });

    if (!task || task.deletedAt) {
      throw new NotFoundException('Task not found');
    }

    if (task.authorId !== userId) {
      throw new ForbiddenException('Only the customer can leave reviews for this task');
    }

    if (task.status !== TaskStatus.COMPLETED) {
      throw new BadRequestException('Reviews are only allowed after the task is completed');
    }

    if (!task.assigneeId) {
      throw new BadRequestException('No assignee is registered for this task');
    }

    const rating = Number(dto.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const reviewerDetails = task.author.userDetails;
    const revieweeDetails = task.assignee!.userDetails;

    if (!reviewerDetails || !revieweeDetails) {
      throw new NotFoundException('Reviewer or reviewee profile details not found');
    }

    if (reviewerDetails.id === revieweeDetails.id) {
      throw new BadRequestException('You cannot review yourself');
    }

    // Check duplicate review
    const existingReview = await this.prisma.review.findFirst({
      where: {
        taskId: id,
        authorId: reviewerDetails.id,
        userDetailsId: revieweeDetails.id,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already left a review for this task');
    }

    const review = await this.prisma.review.create({
      data: {
        rating,
        comment: dto.comment?.trim() || null,
        taskId: id,
        authorId: reviewerDetails.id,
        userDetailsId: revieweeDetails.id,
      },
    });

    // Refresh user stats materialized view so average rating is updated instantly
    try {
      await this.prisma.$executeRawUnsafe('REFRESH MATERIALIZED VIEW "UserStats"');
    } catch (err) {
      console.error('Failed to refresh materialized view UserStats:', err);
    }

    return review;
  }
}
