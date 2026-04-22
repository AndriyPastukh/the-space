// auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto) {
    const { email, password } = dto;

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await this.usersService.create(email, passwordHash);

    return {
      message: 'User created successfully',
    };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    // 1. Пошук користувача
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Перевірка паролю
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Генерація токенів
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' },
    );

    const refreshToken = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '30d' },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(dto: RefreshDto) {
    try {
      const decoded = jwt.verify(
        dto.refreshToken,
        process.env.JWT_REFRESH_SECRET!,
      ) as any;

      const newAccessToken = jwt.sign(
        { sub: decoded.sub, email: decoded.email },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: '15m' },
      );

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException({
        message: 'Invalid or expired refresh token',
      });
    }
  }
}
