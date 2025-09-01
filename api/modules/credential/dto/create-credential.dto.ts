import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateCredentialDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type: string;

  @IsString()
  @IsNotEmpty()
  data: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}