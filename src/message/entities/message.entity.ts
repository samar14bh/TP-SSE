import { Chat } from "src/chat/entities/chat.entity";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Chat, chat => chat.messages, { onDelete: 'CASCADE' })
    chat: Chat;

    @ManyToOne(() => User, user => user.messages)
    sender: User;

    @Column({ nullable: true })
    text?: string;

    @Column({ nullable: true })
    image?: string;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
