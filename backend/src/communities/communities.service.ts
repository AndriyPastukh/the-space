import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpaceDto } from '../spaces/dto/create-space.dto';
import { UpdateSpaceDto } from '../spaces/dto/update-space.dto';
import { generateSlug } from '../spaces/space.utils';
import { SpaceMemberRole, JoinRequestStatus } from '@prisma/client';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class CommunitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async create(userId: number, dto: CreateSpaceDto) {
    const slug = await generateSlug(dto.name, 'community', this.prisma);

    const userDetails = await this.prisma.userDetails.findUnique({
      where: { userId },
    });

    if (!userDetails) {
      throw new NotFoundException('User details not found');
    }

    if (dto.directions?.length) {
      const categories = await this.prisma.category.findMany({
        where: { id: { in: dto.directions } },
      });
      if (categories.length !== dto.directions.length) {
        throw new BadRequestException('Some direction IDs are invalid');
      }
    }

    const community = await this.prisma.community.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        avatarUrl: dto.avatarUrl,
        authorId: userId,
        directions: dto.directions?.length
          ? { connect: dto.directions.map((id) => ({ id })) }
          : undefined,
        users: {
          create: {
            userDetailsId: userDetails.id,
            role: SpaceMemberRole.OWNER,
          },
        },
      },
      include: {
        directions: true,
        _count: { select: { users: true } },
      },
    });

    return {
      id: community.id,
      name: community.name,
      slug: community.slug,
      description: community.description,
      avatarUrl: community.avatarUrl,
      directions: community.directions,
      memberCount: community._count.users,
      currentUserStatus: SpaceMemberRole.OWNER,
      createdAt: community.createdAt,
    };
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    directionId?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 20);
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    if (query.directionId) {
      where.directions = { some: { id: Number(query.directionId) } };
    }

    const [items, total] = await Promise.all([
      this.prisma.community.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          directions: true,
          _count: { select: { users: true } },
        },
      }),
      this.prisma.community.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        avatarUrl: item.avatarUrl,
        directions: item.directions,
        memberCount: item._count.users,
        viewsCount: item.viewsCount,
        postsCount: item.postsCount,
        createdAt: item.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(slug: string, userId?: number) {
    const community = await this.prisma.community.findUnique({
      where: { slug },
      include: {
        directions: true,
        users: {
          include: {
            userDetails: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
          take: 10,
        },
        _count: { select: { users: true } },
      },
    });

    if (!community || community.deletedAt) {
      throw new NotFoundException('Community not found');
    }

    let currentUserStatus = 'GUEST';
    if (userId) {
      const userDetails = await this.prisma.userDetails.findUnique({
        where: { userId },
      });
      if (userDetails) {
        const membership = await this.prisma.userCommunity.findUnique({
          where: {
            userDetailsId_communityId: {
              userDetailsId: userDetails.id,
              communityId: community.id,
            },
          },
        });
        if (membership) {
          currentUserStatus = membership.role;
        } else {
          const joinRequest = await this.prisma.communityJoinRequest.findUnique({
            where: {
              communityId_userDetailsId: {
                communityId: community.id,
                userDetailsId: userDetails.id,
              },
            },
          });
          if (joinRequest?.status === JoinRequestStatus.PENDING) {
            currentUserStatus = 'PENDING';
          }
        }
      }
    }

    return {
      id: community.id,
      name: community.name,
      slug: community.slug,
      description: community.description,
      avatarUrl: community.avatarUrl,
      directions: community.directions,
      memberCount: community._count.users,
      members: community.users.map((u) => ({
        id: u.userDetails.id,
        name: `${u.userDetails.firstName} ${u.userDetails.lastName}`,
        avatarUrl: u.userDetails.avatarUrl,
        role: u.role,
      })),
      statistics: {
        views: community.viewsCount,
        posts: community.postsCount,
      },
      currentUserStatus,
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
    };
  }

  async findById(id: number, userId?: number) {
    const community = await this.prisma.community.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    return this.findOne(community.slug, userId);
  }

  async update(userId: number, id: number, dto: UpdateSpaceDto) {
    const userDetails = await this.prisma.userDetails.findUnique({
      where: { userId },
    });

    if (!userDetails) {
      throw new NotFoundException('User details not found');
    }

    const membership = await this.prisma.userCommunity.findUnique({
      where: {
        userDetailsId_communityId: {
          userDetailsId: userDetails.id,
          communityId: id,
        },
      },
    });

    if (!membership || (membership.role !== SpaceMemberRole.OWNER && membership.role !== SpaceMemberRole.MODERATOR)) {
      throw new ForbiddenException('Permission denied');
    }

    const currentCommunity = await this.prisma.community.findUnique({
      where: { id },
      select: { avatarUrl: true },
    });

    if (!currentCommunity) {
      throw new NotFoundException('Community not found');
    }

    if (dto.avatarUrl && currentCommunity.avatarUrl && dto.avatarUrl !== currentCommunity.avatarUrl) {
      const key = this.s3Service.extractKeyFromUrl(currentCommunity.avatarUrl);
      if (key) {
        await this.s3Service.deleteFile(key);
      }
    }

    if (dto.directions) {
      const categories = await this.prisma.category.findMany({
        where: { id: { in: dto.directions } },
      });
      if (categories.length !== dto.directions.length) {
        throw new BadRequestException('Some direction IDs are invalid');
      }
    }

    const updatedCommunity = await this.prisma.community.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        avatarUrl: dto.avatarUrl,
        directions: dto.directions
          ? {
              set: [],
              connect: dto.directions.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        directions: true,
      },
    });

    return {
      id: updatedCommunity.id,
      name: updatedCommunity.name,
      slug: updatedCommunity.slug,
      description: updatedCommunity.description,
      avatarUrl: updatedCommunity.avatarUrl,
      directions: updatedCommunity.directions,
      updatedAt: updatedCommunity.updatedAt,
    };
  }

  async remove(userId: number, id: number) {
    const userDetails = await this.prisma.userDetails.findUnique({
      where: { userId },
    });

    if (!userDetails) {
      throw new NotFoundException('User details not found');
    }

    const membership = await this.prisma.userCommunity.findUnique({
      where: {
        userDetailsId_communityId: {
          userDetailsId: userDetails.id,
          communityId: id,
        },
      },
    });

    if (!membership || membership.role !== SpaceMemberRole.OWNER) {
      throw new ForbiddenException('Only OWNER can delete community');
    }

    await this.prisma.community.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Community deleted successfully' };
  }

  async joinRequest(userId: number, id: number) {
    const userDetails = await this.prisma.userDetails.findUnique({
      where: { userId },
    });

    if (!userDetails) {
      throw new NotFoundException('User details not found');
    }

    const membership = await this.prisma.userCommunity.findUnique({
      where: {
        userDetailsId_communityId: {
          userDetailsId: userDetails.id,
          communityId: id,
        },
      },
    });

    if (membership) {
      throw new ConflictException('Already a member of this community');
    }

    const existingRequest = await this.prisma.communityJoinRequest.findUnique({
      where: {
        communityId_userDetailsId: {
          communityId: id,
          userDetailsId: userDetails.id,
        },
      },
    });

    if (existingRequest) {
      if (existingRequest.status === JoinRequestStatus.PENDING) {
        return {
          id: existingRequest.id,
          communityId: id,
          status: JoinRequestStatus.PENDING,
          message: 'Join request sent successfully',
        };
      }
      
      const updatedRequest = await this.prisma.communityJoinRequest.update({
        where: { id: existingRequest.id },
        data: { status: JoinRequestStatus.PENDING },
      });
      return {
        id: updatedRequest.id,
        communityId: id,
        status: JoinRequestStatus.PENDING,
        message: 'Join request sent successfully',
      };
    }

    const request = await this.prisma.communityJoinRequest.create({
      data: {
        communityId: id,
        userDetailsId: userDetails.id,
        status: JoinRequestStatus.PENDING,
      },
    });

    return {
      id: request.id,
      communityId: id,
      status: JoinRequestStatus.PENDING,
      message: 'Join request sent successfully',
    };
  }

  async getPresignedUrl(userId: number, fileName: string, contentType: string) {
    const key = `communities/avatars/${userId}/${Date.now()}-${fileName}`;
    const uploadUrl = await this.s3Service.generatePresignedUrl(key, contentType);
    const publicUrl = `${process.env.S3_PUBLIC_URL || `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`}/${key}`;
    
    return {
      uploadUrl,
      fileName: key,
      publicUrl,
    };
  }
}
