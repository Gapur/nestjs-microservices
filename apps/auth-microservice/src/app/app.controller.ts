import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { CreateUserDto } from '@nestjs-microservices/shared';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('create_user')
  handleCreateUser(newUser: CreateUserDto) {
    return this.appService.createUser(newUser);
  }

  @MessagePattern('get_user')
  handleGetUser(user: CreateUserDto) {
    console.log('auth service', user);
    return this.appService.getUser(user.username);
  }
}
