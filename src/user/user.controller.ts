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
  import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
  
  @ApiTags('user')
  @Controller('user')
  export class UserController {
    constructor(private readonly userService: UserService) {}
    @ApiOperation({ summary: 'Create User' })
    @Post()
    @UsePipes(new ValidationPipe())
    @ApiResponse({ status: HttpStatus.CREATED, description: 'User created successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
    async create(@Body() createUserDto: CreateUserDto) {
      try {
        const result = await this.userService.create(createUserDto);
        return {
          message: 'User created successfully',
          user: result.user,
          refreshToken: result.refreshToken,
        };
      } catch (error) {
        
        if (error instanceof BadRequestException) {
          throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST);
        }
       
        throw new HttpException({ message: 'Internal Server Error' }, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }