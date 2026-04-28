import {
  Controller,
  Get,
  Patch,
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
  @Get('profile')
  async getProfile(@Req() req: any) {
    const userId = req.user.id;
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash, profile, ...result } = user;
    return { ...result, ...profile };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = req.user.id;

    if (updateProfileDto.nickname) {
      const existingUser = await this.usersService.findByNickname(
        updateProfileDto.nickname,
      );
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Nickname already taken');
      }
    }

    // Cleanup old avatar from S3 if updating to a new one
    if (updateProfileDto.avatarUrl) {
      const user = await this.usersService.findById(userId);
      if (user?.profile?.avatarUrl) {
        const oldKey = this.s3Service.extractKeyFromUrl(user.profile.avatarUrl);
        if (oldKey) {
          await this.s3Service.deleteFile(oldKey);
        }
      }
    }

    const updatedUser = await this.usersService.update(userId, updateProfileDto);
    const { passwordHash, profile, ...result } = updatedUser;
    return { ...result, ...profile };
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

  @Get(':nickname')
  async getPublicProfile(@Param('nickname') nickname: string) {
    return this.usersService.getPublicProfile(nickname);
  }
}
