import { InjectRepository } from "@nestjs/typeorm";
import { Chat } from "./entities/chat.entity";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findOrCreateChat(userIds: string[]): Promise<Chat> {
    const users = await this.userRepo.findByIds(userIds);
    if (users.length !== 2) throw new Error('Invalid participants');

    const existingChat = await this.chatRepo
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.participants', 'participant')
      .where('participant.id IN (:...ids)', { ids: userIds })
      .groupBy('chat.id')
      .having('COUNT(participant.id) = :count', { count: userIds.length })
      .getOne();

    if (existingChat) return existingChat;

    const chat = this.chatRepo.create({ participants: users });
    return this.chatRepo.save(chat);
  }
}
