import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Body,
  UseGuards,
  Req,
  ConflictException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { S3Service } from '../s3/s3.service';

@Controller('api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    const userId = req.user.id;
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash, userDetails, ...result } = user;

    // Transform for frontend compatibility (merging KAN-86 flattening with rich data)
    const transformedProfile = {
      ...userDetails,
      skillTags: userDetails.skills.map((s: any) => s.name),
      interestTags: userDetails.interests.map((i: any) => i.name),
      categories: userDetails.categories.map((c: any) => c.category),
      socialLinks: userDetails.socialLinks.map((sl: any) => ({
        platform: sl.platformName,
        url: sl.url,
      })),
      location: {
        country: userDetails.country,
        city: userDetails.city,
      },
      stats: {
        level: userDetails.currentLevel,
        reputation: userDetails.reputation,
        xpPoints: userDetails.xpPoints,
      },
    };
    delete transformedProfile.skills;
    delete transformedProfile.interests;
    delete transformedProfile.id;

    return { ...result, ...transformedProfile };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.id;

    if (updateProfileDto.nickname) {
      const existingUser = await this.usersService.findByNickname(updateProfileDto.nickname);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Nickname already taken');
      }
    }

    // Cleanup old avatar from S3 if updating to a new one
    if (updateProfileDto.avatarUrl) {
      const user = await this.usersService.findById(userId);
      if (user?.userDetails?.avatarUrl) {
        const oldKey = this.s3Service.extractKeyFromUrl(user.userDetails.avatarUrl);
        if (oldKey) {
          await this.s3Service.deleteFile(oldKey);
        }
      }
    }

    const updatedUser = await this.usersService.updateMe(userId, updateProfileDto);
    const { passwordHash, userDetails, ...result } = updatedUser;

    const transformedProfile = {
      ...userDetails,
      skillTags: userDetails.skills.map((s: any) => s.name),
      interestTags: userDetails.interests.map((i: any) => i.name),
      categories: userDetails.categories.map((c: any) => c.category),
      socialLinks: userDetails.socialLinks.map((sl: any) => ({
        platform: sl.platformName,
        url: sl.url,
      })),
      location: {
        country: userDetails.country,
        city: userDetails.city,
      },
      stats: {
        level: userDetails.currentLevel,
        reputation: userDetails.reputation,
        xpPoints: userDetails.xpPoints,
      },
    };
    delete transformedProfile.skills;
    delete transformedProfile.interests;
    delete transformedProfile.id;

    return { ...result, ...transformedProfile };
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/avatar/presign')
  async getAvatarPresignedUrl(
    @Req() req: any,
    @Body('contentType') contentType: string,
  ) {
    const userId = req.user.id;
    const fileName = `avatars/${userId}_${Date.now()}.jpg`;
    const uploadUrl = await this.s3Service.generatePresignedUrl(
      fileName,
      contentType || 'image/jpeg',
    );

    return {
      uploadUrl,
      fileName,
      publicUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const user = await this.usersService.getById(Number(id));
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteMe(@Req() req: any) {
    const userId = req.user.id;
    await this.usersService.deleteMe(userId);
    return { message: 'User deleted successfully' };
  }
}
