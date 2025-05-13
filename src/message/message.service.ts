import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { Chat } from 'src/chat/entities/chat.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
    @InjectRepository(Chat) private readonly chatRepo: Repository<Chat>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async sendMessage(
    chatId: number,
    senderId: string,
    text?: string,
    image?: string,
  ): Promise<Message> {
    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    const sender = await this.userRepo.findOne({ where: { id: senderId } });

    if (!chat || !sender) {
      throw new Error('Chat or sender not found');
    }

    const message = this.messageRepo.create({
      chat,
      sender,
      text,
      image,
    });

    return this.messageRepo.save(message);
  }

  async getMessages(chatId: number): Promise<Message[]> {
    return this.messageRepo.find({
      where: { chat: { id: chatId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }
}
