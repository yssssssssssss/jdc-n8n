import { IsString, IsOptional, IsEnum, IsBoolean, IsObject, IsUUID, Length } from 'class-validator';
import { CredentialType } from '../credential.entity';

export class CreateCredentialDto {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(CredentialType)
  type: CredentialType;

  @IsObject()
  config: Record<string, any>;

  @IsOptional()
  @IsObject()
  encryptedData?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCredentialDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(CredentialType)
  type?: CredentialType;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @IsOptional()
  @IsObject()
  encryptedData?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class TestCredentialDto {
  @IsUUID()
  credentialId: string;

  @IsOptional()
  @IsObject()
  testConfig?: Record<string, any>;
}

export class CredentialListResponseDto {
  credentials: Credential[];
  total: number;
  page: number;
  limit: number;
}

export class CredentialResponseDto {
  id: string;
  name: string;
  description?: string;
  type: CredentialType;
  config: Record<string, any>;
  isActive: boolean;
  lastTestedAt?: Date;
  testPassed: boolean;
  testError?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// 导入 Credential 实体用于响应
import { Credential } from '../credential