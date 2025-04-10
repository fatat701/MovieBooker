import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './AuthService';
import { Register } from './dto/Register';
import { Login } from './dto/Login';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Auth') 
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Inscription utilisateur' })
  @Post('register')
register(@Body() dto: Register) {
  return this.authService.register(dto.name, dto.email, dto.password, dto.role);
}

 
  @Post('login')
  @ApiOperation({ summary: 'Connexion utilisateur' })
  login(@Body() dto: Login) {
    return this.authService.login(dto.email, dto.password);
  }
}
