import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return true;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return true;
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
      request.user = {
        id: payload.sub,
        email: payload.email,
      };
    } catch (error) {
      // Ignore invalid token, just treat as guest
    }

    return true;
  }
}
