import { Controller, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { CreateUserDto } from '@nestjs-microservices/shared';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('create_user')
  handleCreateUser(@Payload(ValidationPipe) newUser: CreateUserDto) {
    return this.appService.createUser(newUser);
  }

  @MessagePattern('get_user')
  handleGetUser(@Payload(ValidationPipe) user: CreateUserDto) {
    return this.appService.getUser(user.username);
  }
}
