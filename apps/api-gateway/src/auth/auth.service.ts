import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { CreateUserDto } from '@nestjs-microservices/shared';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_MICROSERVICE') private readonly authClient: ClientProxy
  ) {}

  createUser(createUserDto: CreateUserDto) {
    this.authClient.send('create_user', JSON.stringify(createUserDto));
  }

  getUser(createUserDto: CreateUserDto) {
    this.authClient.send('get_user', JSON.stringify(createUserDto))
  }
}
