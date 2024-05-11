import { Injectable } from '@nestjs/common';

import { CreateUserDto, User } from '@nestjs-microservices/shared';

@Injectable()
export class UserRepository {
  private users: User[] = [];

  save(user: CreateUserDto) {
    console.log('initial user', user);
    const newUser = new User(this.users.length + 1, user.username, user.password);
    console.log('save', newUser);
    this.users.push(newUser);
    return newUser;
  }

  findOne(username: string) {
    console.log('username', username);
    console.log('users', this.users);
    return this.users.find((user) => user.username === username);
  }
}
