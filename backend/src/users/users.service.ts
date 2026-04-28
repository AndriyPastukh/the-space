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
      include: { profile: true },
    });
  }

  async findById(id: number): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async findByNickname(nickname: string): Promise<any | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { nickname },
      include: { user: true },
    });
    return profile ? { ...profile.user, profile } : null;
  }

  async update(id: number, data: any): Promise<any> {
    const {
      firstName,
      lastName,
      nickname,
      bio,
      avatarUrl,
      skillTags,
      interestTags,
    } = data;
    return this.prisma.user.update({
      where: { id },
      data: {
        profile: {
          update: {
            firstName,
            lastName,
            nickname,
            bio,
            avatarUrl,
            skillTags,
            interestTags,
          },
        },
      },
      include: { profile: true },
    });
  }

  async getPublicProfile(nickname: string): Promise<PublicProfileDto> {
    const profile = await this.prisma.profile.findFirst({
      where: {
        nickname: {
          equals: nickname,
          mode: 'insensitive',
        },
      },
      include: {
        badges: {
          include: {
            badge: true,
          },
        },
        communities: {
          include: {
            community: true,
          },
        },
        portfolioItems: true,
        tasks: {
          where: { status: 'COMPLETED' },
          select: { points: true },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    // Fetch aggregated stats from the Materialized View
    const stats = await this.prisma.userStats.findUnique({
      where: { profileId: profile.id },
    });

    const averageRating = stats?.averageRating || 0;

    // Calculate XP from completed tasks
    const totalXP = profile.tasks.reduce((sum, task) => sum + task.points, 0);

    const { level, xpProgress } = this.calculateLevel(totalXP);

    return {
      firstName: profile.firstName,
      nickname: profile.nickname,
      avatarUrl: profile.avatarUrl,
      tags: {
        skills: profile.skillTags,
        interests: profile.interestTags,
      },
      stats: {
        rating: parseFloat(averageRating.toFixed(1)),
        level,
        xpProgress,
      },
      badges: profile.badges.map((ub) => ({
        name: ub.badge.name,
        iconUrl: ub.badge.iconUrl,
        description: ub.badge.description,
      })),
      communities: profile.communities.map((uc) => ({
        name: uc.community.name,
        slug: uc.community.slug,
        avatarUrl: uc.community.avatarUrl,
      })),
      portfolio: profile.portfolioItems.map((pi) => ({
        title: pi.title,
        description: pi.description,
        link: pi.link,
      })),
    };
  }

  // MVP approach to refresh Materialized View on-demand
  async refreshUserStats() {
    await this.prisma.$executeRaw`REFRESH MATERIALIZED VIEW "UserStats"`;
  }

  private calculateLevel(xp: number) {
    const level = Math.floor(xp / 1000) + 1;
    const xpProgress = Math.floor((xp % 1000) / 10);
    return { level, xpProgress };
  }

  async create(email: string, passwordHash: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });
  }
}
