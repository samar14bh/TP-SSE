// src/chat/entities/reaction.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class Reaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  emoji: string;

  @Column()
  author: string; // Or user ID if you have user system

  @ManyToOne(() => Message, message => message.reactions)
  message: Message;
}