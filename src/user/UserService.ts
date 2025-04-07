import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { RegisterDto } from '../dto/RegisterDto';
import { LoginDto } from '../dto/LoginDto';

interface User {
  email: string;
  password: string;
}

@Injectable()
export class UserService {
  private users: User[] = [];

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const userExists = this.users.find(user => user.email === email);
    if (userExists) {
      throw new BadRequestException('Utilisateur déjà existant');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = { email, password: hashedPassword };
    this.users.push(newUser);

    return { message: 'Inscription réussie', user: { email } };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = this.users.find(user => user.email === email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const token = jwt.sign({ email: user.email }, 'SECRET_KEY', { expiresIn: '1h' });

    return { message: 'Connexion réussie', token };
  }
}
