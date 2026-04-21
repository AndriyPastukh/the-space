// auth/auth.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto) {
    const { email, password } = dto;

    // 1. перевірка унікальності
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // 2. хешування
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. створення
    await this.usersService.create(email, passwordHash);

    return {
      message: 'User created successfully',
    };
  }
}
