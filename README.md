# NestJS Microservices

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Building Microservices with NestJS, TCP and Typescript

As our projects get bigger and bigger, we need more and more advanced architecture. Therefore, as a software engineer, I would like to introduce you to the modern popular microservice architecture that follows the concept of SOA (Service Oriented Architecture).

In this article, I want to talk about the difference between monolithic and microservice architectures and show how to build them using NestJS, TCP and Typescript. Let’s first dive into what microservices are.

## Getting Started

1. Clone this repository
```
git clone git@github.com:Gapur/nestjs-microservices.git
```
2. Install dependencies
```
npm install
```
3. Launch app
```
nx serve api-gateway
nx serve auth-microservice
```

## What are Microservices

Microservices are an architectural approach to software development in which software is composed of small, independent services that communicate through well-defined APIs. Each service supports a specific task or business goal and uses an API to communicate with other modules and services. This makes it easier to scale and faster to develop applications, enabling innovation and bringing new features to market faster.

What are the key differences between monolithic and microservice architectures? If monolithic, then all functions and services in the application are combined and work as a single unit. But a microservice breaks down the underlying logic into different tasks or services, each of which can be developed, deployed separately and exposed via an API.

For a better understanding, we will develop a microservices project together in NestJS.

## Setting Up the Project

Before we start, I would like to highlight two main aspects of our project:
auth-microservice — authentication service responsible for managing user permissions
API Gateway — a service between the client and the microservices that emits events from the HTTP API endpoint to the microservice

In short, when a user logs in with credentials through the /api/login endpoint, they are connected to the API Gateway. The API Gateway then sends and receives a message from the authentication microservice using a request-response style message pattern. This is roughly how our app will work.

Since we’ll be building multiple services, it’s best to have a monorepo project, which is a single version-controlled code repository that includes various apps and libraries. Hence, we are going to use the Nx tool for mono-repository management, which allows you to build and scale web apps and services in a mono-repository.

First, let’s just create a monorepo project with the following command:
```sh
npx create-nx-workspace nestjs-microservices --preset=nest
```

Specify the app name as api-gateway.

Now let’s install the project dependencies by running the following commands:
```sh
cd nestjs-microservices
npm i @nestjs/microservices class-validator class-transformer
```

## Adding an Auth Module

Since our project is created, nx has already created an API Gateway service application for us. Now we will create an auth module in our API Gateway app that is responsible for handling authentication related requests.

When a user makes a request to our app, then the API Gateway receives and sends the request to the microservices. So they will use the same data type and it makes sense to create a shared library in our monorepo and avoid duplicating the same code all over the place with the following command:
```sh
nx g @nx/nest:lib shared
```

Now, let’s create a dto folder and add create-user.dto.ts file:
```ts
// shared/src/lib/dto/create-user.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}
```

Also we can add a path entry in the tsconfig.base.json and import them with absolute paths:

```json
{
  ...
  "compilerOptions": {
    ...
    "paths": {
      "@nestjs-microservices/shared": ["shared/src/index.ts"]
    }
  },
  ...
}
```

NestJS transports messages between different microservice instances using the default TCP transport layer. NestJS provides a ClientsModule which exposes the static register() method that takes as an argument an array of objects describing the microservice transporters. Let’s add auth.service.ts and register AUTH_MICROSERVICE using the following lines of code:

```ts
// apps/api-gateway/src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_MICROSERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3001,
        },
      },
    ]),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
```

Above, each transporter has a name property, an optional transport property (default is Transport.TCP), and an optional transporter-specific options property.

Once the module has been imported, we can inject a ClientProxy instance configured as specified using the AUTH_MICROSERVICE transporter parameters using the @Inject() decorator in the auth.service.ts as shown below:

```ts
// apps/api-gateway/src/auth/auth.service.ts

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
```

As shown above, we can send a message to the authentication microservice using the get_user or create_user patterns. We will use them when the user logs in or registers.

The send method is designed to call a microservice and returns an Observable as a response. This takes two arguments:
- pattern — one defined in a @MessagePattern() decorator
- payload — the message we want to transmit to the microservice

Last, we’ll create an AuthController class with two API endpoints for login and signup:

```ts
// apps/api-gateway/src/auth/auth.controller.ts

import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { CreateUserDto, User } from '@nestjs-microservices/shared';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() createUserDto: CreateUserDto) {
    const user: User = await lastValueFrom(this.authService.getUser(createUserDto), {
      defaultValue: undefined,
    });
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isMatch = user.password === createUserDto.password;
    if (!isMatch) {
      throw new BadRequestException('Incorrect password');
    }

    console.log(`User ${user.username} successfully logged in.`);

    return user;
  }

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    const user: User = await lastValueFrom(this.authService.getUser(createUserDto), {
      defaultValue: undefined,
    });
    if (user) {
      throw new BadRequestException(
        `Username ${createUserDto.username} already exists!`
      );
    }

    return this.authService.createUser(createUserDto);
  }
}
```

As mentioned earlier, the getUser and createUser auth client methods return an Obserable, which means you need to explicitly subscribe to it before the message is sent. But we can convert an Observable to a Promise using the lastValueFrom method imported from rxjs.
