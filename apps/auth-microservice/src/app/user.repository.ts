import { Injectable } from '@nestjs/common';

import { CreateUserDto, User } from '@nestjs-microservices/shared';

@Injectable()
export class UserRepository {
  private users: User[] = [];

  save(user: CreateUserDto): User {
    const newUser = new User();
    newUser.id = this.users.length + 1;
    newUser.username = user.username;
    newUser.password = user.password;
    this.users.push(newUser);
    return newUser;
  }

  findOne(username: string): User | undefined {
    return this.users.find((user) => user.username === username);
  }
}
