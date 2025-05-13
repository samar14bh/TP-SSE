import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}
