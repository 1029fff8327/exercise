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
  @ApiBody({ type: CreateUserDto, description: 'Пользовательские данные для создания нового пользователя' })
  @ApiResponse({ 
    status: HttpStatus.CREATED,
    description: 'Пользователь успешно создан',
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request' 
  })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.userService.create(createUserDto);
      return {
        message: 'Пользователь успешно создан',
        user: result.user,
        refreshToken: result.refreshToken,
      };
    } catch (error) {
      this.handleCreateUserError(error);
    }
  }

  private handleCreateUserError(error: any): never {
    if (error instanceof BadRequestException) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST);
    }
  
    throw new HttpException({ message: 'Внутренняя ошибка сервера при создании пользователя' }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}