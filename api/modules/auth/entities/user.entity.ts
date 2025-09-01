import { Exclude } from 'class-transformer';

export class UserEntity {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  passwordHash: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}