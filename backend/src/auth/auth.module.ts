import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, UsersService],
})
export class AuthModule {}
