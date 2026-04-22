import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException({ message: 'No token provided' });
    }

    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET!,
      ) as any;

      request.user = {
        id: payload.sub,
        email: payload.email,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException({ message: 'Invalid token' });
    }
  }
}
