import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Reaction } from "./reaction.entity";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  author: string;

  @Column()
  content: string;

  @CreateDateColumn()
  timestamp: Date;

  @OneToMany(() => Reaction, reaction => reaction.message)
  reactions: Reaction[];
}
