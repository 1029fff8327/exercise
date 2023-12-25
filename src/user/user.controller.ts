import {
    Controller,
    Post,
    Body,
    UsePipes,
    ValidationPipe,
    HttpStatus,
    BadRequestException,
    HttpException
  } from '@nestjs/common';
  import { UserService } from './user.service';
  import { CreateUserDto } from './dto/create-user.dto';
  import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
  
  @ApiTags('user')
  @Controller('user')
  export class UserController {
    constructor(private readonly userService: UserService) {}
    @ApiOperation({ summary: 'Create User' })
    @Post()
    @UsePipes(new ValidationPipe())
    @ApiBody({
      type: CreateUserDto,
      description: 'Пользовательские данные для создания нового пользователя',
    })
    @ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Пользователь успешно создан',
    })
    @ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad Request',
    })
    async create(@Body() createUserDto: CreateUserDto) {
      try {
        // Attempt to create the user
        const result = await this.userService.create(createUserDto);
  
        // If successful, send a success response
        return {
          message: 'Пользователь успешно создан',
          user: result.user,
          refreshToken: result.refreshToken,
        };
      } catch (error) {
        // If an error occurs, handle it appropriately
        if (error instanceof BadRequestException) {
          // If it's a known validation error, send a 400 Bad Request response
          return {
            message: error.message,
          };
        } else {
          // If it's an unknown error, log it and send a 500 Internal Server Error response
          console.error('Error creating user:', error);
  
          return {
            message: 'Внутренняя ошибка сервера',
          };
        }
      }
    }
  }