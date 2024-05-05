import { Injectable } from '@nestjs/common';

import { User } from '@nestjs-microservices/shared';

@Injectable()
export class UserRepository {
  private readonly users: User[] = [];

  save(user: User) {
    const createdUser = { ...user, id: this.users.length + 1 };
    this.users.push(createdUser);
    return createdUser;
  }

  findOne(username: string) {
    return this.users.find((user) => user.username === username);
  }
}
