import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialService } from './credential.service';
import { CredentialController } from './credential.controller';
import { Credential } from './credential.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Credential])],
  controllers: [CredentialController],
  providers: [CredentialService],
  exports: [CredentialService],
})
export class CredentialModule {}