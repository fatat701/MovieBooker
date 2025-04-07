import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards
} from '@nestjs/common';

import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './UserService';
import { RegisterDto } from '../dto/RegisterDto';
import { LoginDto } from '../dto/LoginDto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Inscription utilisateur' })
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.userService.register(registerDto);
  }

  @ApiOperation({ summary: 'Connexion utilisateur' })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Afficher le profil (protégé)' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return { user: req.user };
  }
}
