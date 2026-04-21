// users/users.service.ts
import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user/user.interface';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private idCounter = 1;

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((u) => u.email === email);
  }

  async create(email: string, passwordHash: string): Promise<User> {
    const user: User = {
      id: this.idCounter++,
      email,
      passwordHash,
    };

    this.users.push(user);
    return user;
  }
}
