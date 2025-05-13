import { IsEmail, IsNotEmpty } from "class-validator";
import { Chat } from "src/chat/entities/chat.entity";
import { Cv } from "src/cv/entities/cv.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique:true})
    username: string;

    @Column({unique:true})
    @IsEmail()
    email: string;

    @Column()
    @IsNotEmpty()
    password: string;

    @Column({ type: 'varchar', length: 100 })
    salt: string;  
    @Column({ type: 'varchar', length: 50 })
    role: string;

    @OneToMany(() => Cv, (cv: Cv) => cv.user)
    cvs: Cv[];

    @OneToMany(() => Chat, (chat) => chat.sender)
    sentMessages: Chat[];

    @OneToMany(() => Chat, (chat) => chat.receiver)
    receivedMessages: Chat[];

}
