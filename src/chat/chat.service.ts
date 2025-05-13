// src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  private messages: Message[] = [];
  private idCounter = 1;

  saveMessage(author: string, content: string): Message {
    const message: Message = {
      id: this.idCounter++,
      author,
      content,
      timestamp: new Date(),
    };
    this.messages.push(message);
    return message;
  }

  getAllMessages(): Message[] {
    return this.messages;
  }
}
