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
export class TeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async create(userId: number, dto: CreateSpaceDto) {
    const slug = await generateSlug(dto.name, 'team', this.prisma);

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

    const team = await this.prisma.team.create({
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
      id: team.id,
      name: team.name,
      slug: team.slug,
      description: team.description,
      avatarUrl: team.avatarUrl,
      directions: team.directions,
      memberCount: team._count.users,
      currentUserStatus: SpaceMemberRole.OWNER,
      createdAt: team.createdAt,
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
      this.prisma.team.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          directions: true,
          _count: { select: { users: true } },
        },
      }),
      this.prisma.team.count({ where }),
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
    const team = await this.prisma.team.findUnique({
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

    if (!team || team.deletedAt) {
      throw new NotFoundException('Team not found');
    }

    let currentUserStatus = 'GUEST';
    if (userId) {
      const userDetails = await this.prisma.userDetails.findUnique({
        where: { userId },
      });
      if (userDetails) {
        const membership = await this.prisma.userTeam.findUnique({
          where: {
            userDetailsId_teamId: {
              userDetailsId: userDetails.id,
              teamId: team.id,
            },
          },
        });
        if (membership) {
          currentUserStatus = membership.role;
        } else {
          const joinRequest = await this.prisma.teamJoinRequest.findUnique({
            where: {
              teamId_userDetailsId: {
                teamId: team.id,
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
      id: team.id,
      name: team.name,
      slug: team.slug,
      description: team.description,
      avatarUrl: team.avatarUrl,
      directions: team.directions,
      memberCount: team._count.users,
      members: team.users.map((u) => ({
        id: u.userDetails.id,
        name: `${u.userDetails.firstName} ${u.userDetails.lastName}`,
        avatarUrl: u.userDetails.avatarUrl,
        role: u.role,
      })),
      statistics: {
        views: team.viewsCount,
        posts: team.postsCount,
      },
      currentUserStatus,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    };
  }

  async findById(id: number, userId?: number) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return this.findOne(team.slug, userId);
  }

  async update(userId: number, id: number, dto: UpdateSpaceDto) {
    const userDetails = await this.prisma.userDetails.findUnique({
      where: { userId },
    });

    if (!userDetails) {
      throw new NotFoundException('User details not found');
    }

    const membership = await this.prisma.userTeam.findUnique({
      where: {
        userDetailsId_teamId: {
          userDetailsId: userDetails.id,
          teamId: id,
        },
      },
    });

    if (!membership || (membership.role !== SpaceMemberRole.OWNER && membership.role !== SpaceMemberRole.MODERATOR)) {
      throw new ForbiddenException('Permission denied');
    }

    const currentTeam = await this.prisma.team.findUnique({
      where: { id },
      select: { avatarUrl: true },
    });

    if (!currentTeam) {
      throw new NotFoundException('Team not found');
    }

    if (dto.avatarUrl && currentTeam.avatarUrl && dto.avatarUrl !== currentTeam.avatarUrl) {
      const key = this.s3Service.extractKeyFromUrl(currentTeam.avatarUrl);
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

    const updatedTeam = await this.prisma.team.update({
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
      id: updatedTeam.id,
      name: updatedTeam.name,
      slug: updatedTeam.slug,
      description: updatedTeam.description,
      avatarUrl: updatedTeam.avatarUrl,
      directions: updatedTeam.directions,
      updatedAt: updatedTeam.updatedAt,
    };
  }

  async remove(userId: number, id: number) {
    const userDetails = await this.prisma.userDetails.findUnique({
      where: { userId },
    });

    if (!userDetails) {
      throw new NotFoundException('User details not found');
    }

    const membership = await this.prisma.userTeam.findUnique({
      where: {
        userDetailsId_teamId: {
          userDetailsId: userDetails.id,
          teamId: id,
        },
      },
    });

    if (!membership || membership.role !== SpaceMemberRole.OWNER) {
      throw new ForbiddenException('Only OWNER can delete team');
    }

    await this.prisma.team.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Team deleted successfully' };
  }

  async joinRequest(userId: number, id: number) {
    const userDetails = await this.prisma.userDetails.findUnique({
      where: { userId },
    });

    if (!userDetails) {
      throw new NotFoundException('User details not found');
    }

    const membership = await this.prisma.userTeam.findUnique({
      where: {
        userDetailsId_teamId: {
          userDetailsId: userDetails.id,
          teamId: id,
        },
      },
    });

    if (membership) {
      throw new ConflictException('Already a member of this team');
    }

    const existingRequest = await this.prisma.teamJoinRequest.findUnique({
      where: {
        teamId_userDetailsId: {
          teamId: id,
          userDetailsId: userDetails.id,
        },
      },
    });

    if (existingRequest) {
      if (existingRequest.status === JoinRequestStatus.PENDING) {
        return {
          id: existingRequest.id,
          teamId: id,
          status: JoinRequestStatus.PENDING,
          message: 'Join request sent successfully',
        };
      }
      
      const updatedRequest = await this.prisma.teamJoinRequest.update({
        where: { id: existingRequest.id },
        data: { status: JoinRequestStatus.PENDING },
      });
      return {
        id: updatedRequest.id,
        teamId: id,
        status: JoinRequestStatus.PENDING,
        message: 'Join request sent successfully',
      };
    }

    const request = await this.prisma.teamJoinRequest.create({
      data: {
        teamId: id,
        userDetailsId: userDetails.id,
        status: JoinRequestStatus.PENDING,
      },
    });

    return {
      id: request.id,
      teamId: id,
      status: JoinRequestStatus.PENDING,
      message: 'Join request sent successfully',
    };
  }

  async getPresignedUrl(userId: number, fileName: string, contentType: string) {
    const key = `teams/avatars/${userId}/${Date.now()}-${fileName}`;
    const uploadUrl = await this.s3Service.generatePresignedUrl(key, contentType);
    const publicUrl = `${process.env.S3_PUBLIC_URL || `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`}/${key}`;
    
    return {
      uploadUrl,
      fileName: key,
      publicUrl,
    };
  }
}
