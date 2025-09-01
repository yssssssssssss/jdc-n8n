import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

export enum CredentialType {
  DATABASE = 'database',
  API = 'api',
  EMAIL = 'email',
  FTP = 'ftp',
  SSH = 'ssh',
  WEBHOOK = 'webhook',
  OAUTH = 'oauth',
  CUSTOM = 'custom'
}

@Entity('credentials')
export class Credential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: CredentialType,
    default: CredentialType.CUSTOM
  })
  type: CredentialType;

  @Column({ type: 'json' })
  config: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  encryptedData?: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastTestedAt?: Date;

  @Column({ default: false })
  testPassed: boolean;

  @Column({ type: 'text', nullable: true })
  testError?: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}