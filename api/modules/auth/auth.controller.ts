import { Controller, Post, Body, HttpCode, HttpStatus, UsePipes, ValidationPipe, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto, RegisterResponseDto } from './dto';

@Controller('auth')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {
    console.log('AuthController constructor called');
    console.log('AuthService in controller:', this.authService);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
    console.log('AuthService:', this.authService);
    if (!this.authService) {
      return { error: 'AuthService not injected' } as any;
    }
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }
}