import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { PublicProfileDto } from './dto/public-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByNickname(nickname: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { nickname },
    });
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async getPublicProfile(nickname: string): Promise<PublicProfileDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        nickname: {
          equals: nickname,
          mode: 'insensitive',
        },
      },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
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
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rating =
      user.reviews.length > 0
        ? user.reviews.reduce((acc, r) => acc + r.rating, 0) /
          user.reviews.length
        : 0;

    const { level, xpProgress } = this.calculateLevel(user.totalXP);

    return {
      firstName: user.firstName,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      tags: {
        skills: user.skillTags,
        interests: user.interestTags,
      },
      stats: {
        rating: parseFloat(rating.toFixed(1)),
        level,
        xpProgress,
      },
      badges: user.badges.map((ub) => ({
        name: ub.badge.name,
        iconUrl: ub.badge.iconUrl,
        description: ub.badge.description,
      })),
      communities: user.communities.map((uc) => ({
        name: uc.community.name,
        slug: uc.community.slug,
        avatarUrl: uc.community.avatarUrl,
      })),
      portfolio: user.portfolioItems.map((pi) => ({
        title: pi.title,
        description: pi.description,
        link: pi.link,
      })),
    };
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
