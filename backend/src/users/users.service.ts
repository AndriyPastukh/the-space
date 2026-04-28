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
        profile: {
          where: { deletedAt: null },
          include: { skills: true, interests: true, socialLinks: true },
        },
      },
    });
  }

  async findById(id: number): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          where: { deletedAt: null },
          include: { skills: true, interests: true, socialLinks: true },
        },
      },
    });
  }

  async findByNickname(nickname: string): Promise<any | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { nickname },
      include: {
        user: true,
        skills: true,
        interests: true,
        socialLinks: true,
      },
    });
    if (!profile || profile.deletedAt) return null;
    return { ...profile.user, profile };
  }

  async update(id: number, data: any): Promise<any> {
    const {
      firstName,
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
      where: { id },
      data: {
        profile: {
          update: {
            firstName,
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
                  create: socialLinks,
                }
              : undefined,
          },
        },
      },
      include: {
        profile: {
          include: { skills: true, interests: true, socialLinks: true },
        },
      },
    });

    if (updatedUser.profile) {
      await this.syncLevel(updatedUser.profile.id);
    }

    return updatedUser;
  }

  private async syncLevel(profileId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { xpPoints: true, currentLevel: true },
    });

    if (!profile) return;

    const newLevel = Math.floor(profile.xpPoints / 1000) + 1;

    if (newLevel !== profile.currentLevel) {
      await this.prisma.profile.update({
        where: { id: profileId },
        data: { currentLevel: newLevel },
      });
    }
  }

  async getPublicProfile(nickname: string): Promise<PublicProfileDto> {
    const profile = await this.prisma.profile.findFirst({
      where: {
        nickname: {
          equals: nickname,
          mode: 'insensitive',
        },
        deletedAt: null,
      },
      include: {
        skills: true,
        interests: true,
        socialLinks: true,
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

    const stats = await this.prisma.userStats.findUnique({
      where: { profileId: profile.id },
    });

    const averageRating = stats?.averageRating || 0;

    // Use de-normalized currentLevel for speed, but fallback if needed
    const level = profile.currentLevel;

    return {
      firstName: profile.firstName,
      lastName: profile.lastName,
      nickname: profile.nickname,
      avatarUrl: profile.avatarUrl,
      coverImageUrl: profile.coverImageUrl,
      bio: profile.bio,
      status: profile.status,
      location: {
        country: profile.country,
        city: profile.city,
      },
      socialLinks: profile.socialLinks.map((sl) => ({
        platform: sl.platformName,
        url: sl.url,
      })),
      tags: {
        skills: profile.skills.map((s) => s.name),
        interests: profile.interests.map((i) => i.name),
      },
      stats: {
        rating: parseFloat(averageRating.toFixed(1)),
        level,
        xpProgress: Math.floor((profile.xpPoints % 1000) / 10),
        reputation: profile.reputation,
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
