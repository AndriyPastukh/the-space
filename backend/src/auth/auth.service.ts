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
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

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

    // Зберігаємо Refresh Token в БД
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
      },
    });

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

      // ПЕРЕВІРКА: Чи існує токен в базі даних (Revocation check)
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: dto.refreshToken },
      });

      if (!storedToken) {
        throw new UnauthorizedException({
          message: 'Invalid or expired refresh token',
        });
      }

      const newAccessToken = jwt.sign(
        { sub: decoded.sub, email: decoded.email },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: '15m' },
      );

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException({
        message: 'Invalid or expired refresh token',
      });
    }
  }

  async logout(refreshToken: string) {
    try {
      await this.prisma.refreshToken.delete({
        where: { token: refreshToken },
      });
    } catch (error) {
      // Якщо токена вже немає (наприклад, видалений раніше), просто ігноруємо
    }
    return { message: 'Logged out successfully' };
  }
}
