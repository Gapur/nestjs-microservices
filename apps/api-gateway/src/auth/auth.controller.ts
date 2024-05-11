import { Body, Controller, Post } from '@nestjs/common';

import { CreateUserDto } from '@nestjs-microservices/shared';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() createUserDto: CreateUserDto) {
    console.log('login', createUserDto);
    return this.authService.getUser(createUserDto);
  }

  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }
}
