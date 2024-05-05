import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';

import { CreateUserDto } from '@nestjs-microservices/shared';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.authService.getUser(createUserDto);
  }

  @Post('signup')
  signup(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }
}
