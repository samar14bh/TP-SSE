
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Reaction } from './entities/reaction.entity';

@Injectable()
export class ChatService implements OnModuleInit {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Reaction)
    private readonly reactionRepository:Repository<Reaction>
  ) {}
  private messages: Message[] = []; 
  private idCounter = 4;
  async onModuleInit() {
    await this.loadMessagesFromDatabase();
  }



  async saveMessage(author: string, content: string): Promise<Message> {

    const newMessage = this.messageRepository.create({
      author,
      content,
      timestamp: new Date(),
    });
    const savedMessage = await this.messageRepository.save(newMessage);
    this.messages.push(savedMessage);
    return savedMessage;
  }

  async getAllMessages(): Promise<Message[]> {
    return this.messages.map(message => ({
      ...message,
      reactions: message.reactions || []
    }));
  }


  private async loadMessagesFromDatabase(): Promise<void> {
    this.messages = await this.messageRepository.find({relations: ['reactions']});
    if (this.messages.length > 0) {
      this.idCounter = Math.max(...this.messages.map(m => m.id)) + 1;
    }
  }

  async addReaction(messageId: number, emoji: string, userId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['reactions'],
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    message.reactions = message.reactions.filter(r => r.author !== userId);

    const reaction = this.reactionRepository.create({ emoji, author: userId, message });
    await this.reactionRepository.save(reaction);
    this.loadMessagesFromDatabase();
    message.reactions.push(reaction);
    const updatedMessage = await this.messageRepository.findOne({
    where: { id: message.id },
    relations: ['reactions'],
  });

    if (!updatedMessage) {
      throw new NotFoundException(`Updated message with ID ${message.id} not found`);
    }

    return updatedMessage;

  }
  async removeReaction(messageId: number, userId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['reactions'],
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    message.reactions = message.reactions.filter(r => r.author !== userId);
    await this.reactionRepository.delete({ message: { id: messageId }, author: userId });
    this.loadMessagesFromDatabase();
    
  const updatedMessage = await this.messageRepository.findOne({
    where: { id: messageId },
    relations: ['reactions'],
  });

  if (!updatedMessage) {
    throw new NotFoundException(`Message with ID ${messageId} not found`);
  }

  return updatedMessage;

  }

}
