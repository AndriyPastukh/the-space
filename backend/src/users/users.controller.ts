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

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    const userId = req.user.id;
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.id;

    if (updateProfileDto.nickname) {
      const existingUser = await this.usersService.findByNickname(updateProfileDto.nickname);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Nickname already taken');
      }
    }

    const updatedUser = await this.usersService.update(userId, updateProfileDto);
    const { passwordHash, ...result } = updatedUser;
    return result;
  }

  @Get(':nickname')
  async getPublicProfile(@Param('nickname') nickname: string) {
    return this.usersService.getPublicProfile(nickname);
  }
}
