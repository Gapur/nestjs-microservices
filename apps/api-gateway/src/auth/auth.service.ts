import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { CreateUserDto, User } from '@nestjs-microservices/shared';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_MICROSERVICE') private readonly authClient: ClientProxy
  ) {}

  getUser(createUserDto: CreateUserDto) {
    return this.authClient.send<User, CreateUserDto>('get_user', createUserDto);
  }

  createUser(createUserDto: CreateUserDto) {
    return this.authClient.send<User, CreateUserDto>('create_user', createUserDto);
  }
}
