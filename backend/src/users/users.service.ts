import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
            categories: categories
              ? {
                  set: [],
                  connectOrCreate: categories.map((cat: string) => ({
                    where: { category: cat },
                    create: { category: cat },
                  })),
                }
              : undefined,
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
      categories: details.categories.map((c: any) => c.category),
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
