
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read'
}

@Entity()
export class CvEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cvId: string;

  @Column({
    type: 'enum',
    enum: OperationType,
    default: OperationType.READ
  })
  typeOperation: OperationType;

  @CreateDateColumn()
  dateHeure: Date;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({ nullable: true })
  details: string;
}