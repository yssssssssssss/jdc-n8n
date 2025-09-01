import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度至少6位' })
  @MaxLength(50, { message: '密码长度不能超过50位' })
  password: string;

  @IsString({ message: '姓名必须是字符串' })
  @IsNotEmpty({ message: '姓名不能为空' })
  @MaxLength(100, { message: '姓名长度不能超过100位' })
  name: string;
}