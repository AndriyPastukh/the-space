import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { User } from '@prisma/client';
import { PublicProfileDto } from './dto/public-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        userDetails: {
          include: {
            skills: true,
            interests: true,
            socialLinks: true,
            categories: true,
          },
        },
      },
    });
  }

  async findById(id: number): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        userDetails: {
          include: {
            skills: true,
            interests: true,
            socialLinks: true,
            categories: true,
          },
        },
      },
    });
  }

  async findByNickname(nickname: string): Promise<any | null> {
    const details = await this.prisma.userDetails.findUnique({
      where: { nickname },
      include: {
        user: true,
        skills: true,
        interests: true,
        socialLinks: true,
        categories: true,
      },
    });
    if (!details || details.deletedAt) return null;
    return { ...details.user, userDetails: details };
  }

  async updateMe(userId: number, data: any): Promise<any> {
    const {
      firstName,
      middleName,
      lastName,
      nickname,
      phoneNumber,
      bio,
      avatarUrl,
      coverImageUrl,
      status,
      birthday,
      country,
      city,
      skillTags,
      interestTags,
      socialLinks,
      categories,
    } = data;

    const prepareTags = (tags: string[]) => {
      if (!tags) return undefined;
      const normalized = tags
        .slice(0, 15)
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0 && t.length <= 30);

      return {
        set: [],
        connectOrCreate: normalized.map((name) => ({
          where: { name },
          create: { name },
        })),
      };
    };

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        userDetails: {
          update: {
            firstName,
            middleName,
            lastName,
            nickname,
            phoneNumber,
            bio,
            avatarUrl,
            coverImageUrl,
            status,
            birthday: birthday ? new Date(birthday) : undefined,
            country,
            city,
            skills: prepareTags(skillTags),
            interests: prepareTags(interestTags),
            socialLinks: socialLinks
              ? {
                  deleteMany: {},
                  create: socialLinks.map((sl: any) => ({
                    platformName: sl.platform || sl.platformName,
                    url: sl.url,
                  })),
                }
              : undefined,
            categories: this.prepareCategoryIds(categories),
          },
        },
      },
      include: {
        userDetails: {
          include: {
            skills: true,
            interests: true,
            socialLinks: true,
            categories: true,
          },
        },
      },
    });

    if (updatedUser.userDetails) {
      await this.syncLevel(updatedUser.userDetails.id);
    }

    return updatedUser;
  }

  private async syncLevel(userDetailsId: number) {
    const details = await this.prisma.userDetails.findUnique({
      where: { id: userDetailsId },
      select: { xpPoints: true, currentLevel: true },
    });

    if (!details) return;

    const newLevel = Math.floor(details.xpPoints / 1000) + 1;

    if (newLevel !== details.currentLevel) {
      await this.prisma.userDetails.update({
        where: { id: userDetailsId },
        data: { currentLevel: newLevel },
      });
    }
  }

  private prepareCategoryIds = (categoryIds?: number[]) => {
    if (!Array.isArray(categoryIds)) return undefined;

    const ids = [...new Set(categoryIds)]
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0);

    return {
      set: [],
      connect: ids.map((id) => ({ id })),
    };
  };

  async searchUsers(params: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(Math.max(1, Number(params.limit) || 6), 50);
    const search = params.search?.trim();

    const where: Prisma.UserDetailsWhereInput = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              {
                firstName: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                middleName: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                lastName: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                bio: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
    };

    const [total, users] = await this.prisma.$transaction([
      this.prisma.userDetails.count({
        where,
      }),
      this.prisma.userDetails.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ reputation: 'desc' }, { id: 'desc' }],
        include: {
          skills: true,
          interests: true,
          categories: true,
        },
      }),
    ]);

    const userDetailsIds = users.map((user) => user.id);

    const stats = await this.prisma.userStats.findMany({
      where: {
        userDetailsId: {
          in: userDetailsIds,
        },
      },
    });

    const statsByUserDetailsId = new Map(
      stats.map((stat) => [stat.userDetailsId, stat]),
    );

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      data: users.map((details) => {
        const userStats = statsByUserDetailsId.get(details.id);

        return {
          id: String(details.userId),
          userDetailsId: details.id,

          firstName: details.firstName,
          middleName: details.middleName,
          lastName: details.lastName,
          nickname: details.nickname,

          avatarUrl: details.avatarUrl,
          coverImageUrl: details.coverImageUrl,
          bio: details.bio,
          status: details.status,

          location: {
            country: details.country,
            city: details.city,
          },

          rating: Number((userStats?.averageRating ?? 0).toFixed(1)),
          reviewCount: userStats?.reviewCount ?? 0,

          level: details.currentLevel,
          xpPoints: details.xpPoints,
          reputation: details.reputation,

          directions: details.categories.map((category) => category.name),
          interests: details.interests.map((interest) => interest.name),
          skills: details.skills.map((skill) => skill.name),
        };
      }),

      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getById(id: number): Promise<any | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        tasks: {
          where: {
            status: 'COMPLETED',
            deletedAt: null,
          },
          select: {
            points: true,
          },
        },
        userDetails: {
          include: {
            skills: true,
            interests: true,
            socialLinks: true,
            categories: true,
            badges: { include: { badge: true } },
            communities: { include: { community: true } },
            portfolioItems: true,
          },
        },
      },
    });

    if (!user || !user.userDetails) return null;

    const details = user.userDetails;

    const statsView = await this.prisma.userStats.findUnique({
      where: { userDetailsId: details.id },
    });

    const averageRating = statsView?.averageRating || 0;

    const completedTaskPoints = user.tasks.reduce(
      (sum, task) => sum + task.points,
      0,
    );

    return {
      id: user.id,
      email: user.email,
      firstName: details.firstName,
      middleName: details.middleName,
      lastName: details.lastName,
      nickname: details.nickname,
      avatarUrl: details.avatarUrl,
      coverImageUrl: details.coverImageUrl,
      bio: details.bio,
      status: details.status,
      location: {
        country: details.country,
        city: details.city,
      },
      socialLinks: details.socialLinks.map((sl) => ({
        platform: sl.platformName,
        url: sl.url,
      })),
      tags: {
        skills: details.skills.map((s) => s.name),
        interests: details.interests.map((i) => i.name),
      },
      categories: details.categories.map((c: any) => ({
        id: c.id,
        name: c.name,
      })),
      stats: {
        rating: parseFloat(averageRating.toFixed(1)),
        level: details.currentLevel,
        xpProgress: Math.floor((details.xpPoints % 1000) / 10),
        reputation: details.reputation,
        completedTaskPoints,
      },
      badges: details.badges.map((ub) => ({
        name: ub.badge.name,
        iconUrl: ub.badge.iconUrl,
        description: ub.badge.description,
      })),
      communities: details.communities.map((uc) => ({
        name: uc.community.name,
        slug: uc.community.slug,
        avatarUrl: uc.community.avatarUrl,
      })),
      portfolio: details.portfolioItems.map((pi) => ({
        title: pi.title,
        description: pi.description,
        link: pi.link,
      })),
    };
  }

  async deleteMe(userId: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async create(email: string, passwordHash: string): Promise<any> {
    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });
  }
}
