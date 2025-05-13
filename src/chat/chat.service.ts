// src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

 async saveMessage(senderId: string, receiverId: string, content: string): Promise<Chat> {
  const sender = await this.userRepository.findOneBy({ id: senderId });
  const receiver = await this.userRepository.findOneBy({ id: receiverId });

  if (!sender || !receiver) {
    throw new Error('Sender or Receiver not found');
  }

  const message = this.chatRepository.create({
    sender,
    receiver,
    content,
    createdAt: new Date(),
  });

  return this.chatRepository.save(message);
}

  async getAllMessages(): Promise<Chat[]> {
    return this.chatRepository.find({
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    });
  }
}
