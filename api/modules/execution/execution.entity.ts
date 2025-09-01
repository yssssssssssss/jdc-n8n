import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/user.entity';
import { Workflow } from '../workflow/workflow.entity';

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('executions')
export class Execution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  workflowId: number;

  @Column()
  userId: number;

  @Column({
    type: 'enum',
    enum: ExecutionStatus,
    default: ExecutionStatus.PENDING,
  })
  status: ExecutionStatus;

  @Column({ type: 'text', nullable: true })
  inputData?: string; // JSON格式的输入数据

  @Column({ type: 'text', nullable: true })
  outputData?: string; // JSON格式的输出数据

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'text', nullable: true })
  logs?: string; // JSON格式的执行日志

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt?: Date;

  @Column({ type: 'int', nullable: true })
  duration?: number; // 执行时长（毫秒）

  @Column({ type: 'varchar', length: 50, nullable: true })
  triggerType?: string; // 触发类型：manual, schedule, webhook等

  @ManyToOne(() => Workflow)
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}