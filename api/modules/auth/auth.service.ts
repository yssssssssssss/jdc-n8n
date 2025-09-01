import { Injectable, UnauthorizedException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto, RegisterResponseDto } from './dto';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {
    console.log('AuthService constructor called');
    console.log('PrismaService:', this.prisma);
    console.log('JwtService:', this.jwtService);
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const { email, password, name } = registerDto;

    // 检查用户是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('该邮箱已被注册');
    }

    // 加密密码
    const passwordHash = await this.hashPassword(password);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });

    const userEntity = new UserEntity(user);
    return new RegisterResponseDto(userEntity);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // 查找用户
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 验证密码
    const isPasswordValid = await this.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 生成JWT令牌
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    const userEntity = new UserEntity(user);
    return new AuthResponseDto(access_token, userEntity);
  }



  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}