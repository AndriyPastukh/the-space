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
  Query,
  DefaultValuePipe,
  ParseIntPipe,
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

    const richProfile = await this.usersService.getById(userId);
    if (!richProfile) {
      throw new NotFoundException('Profile details not found');
    }

    return {
      id: user.id,
      email: user.email,
      ...richProfile,
      // Ensure these fields exist for legacy/compatibility if needed
      skillTags: richProfile.tags?.skills || [],
      interestTags: richProfile.tags?.interests || [],
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
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
      if (user?.userDetails?.avatarUrl) {
        const oldKey = this.s3Service.extractKeyFromUrl(
          user.userDetails.avatarUrl,
        );
        if (oldKey) {
          await this.s3Service.deleteFile(oldKey);
        }
      }
    }

    const updatedUser = await this.usersService.updateMe(
      userId,
      updateProfileDto,
    );
    
    const richProfile = await this.usersService.getById(userId);
    
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      ...richProfile,
      skillTags: richProfile.tags?.skills || [],
      interestTags: richProfile.tags?.interests || []
    };
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

  @Get('search')
  async searchUsers(
    @Query('search') search = '',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit: number,
  ) {
    return this.usersService.searchUsers({
      search,
      page,
      limit,
    });
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
