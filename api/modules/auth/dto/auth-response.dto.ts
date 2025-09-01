import { UserEntity } from '../entities/user.entity';

export class AuthResponseDto {
  access_token: string;
  user: UserEntity;

  constructor(access_token: string, user: UserEntity) {
    this.access_token = access_token;
    this.user = user;
  }
}

export class RegisterResponseDto {
  success: boolean;
  message: string;
  user: UserEntity;

  constructor(user: UserEntity, message = '注册成功') {
    this.success = true;
    this.message = message;
    this.user = user;
  }
}