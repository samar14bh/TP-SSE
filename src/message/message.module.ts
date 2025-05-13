import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Chat } from 'src/chat/entities/chat.entity';
import { User } from 'src/user/entities/user.entity';
import { MessageService } from './message.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Chat, User])],
  providers: [MessageService],
  exports: [MessageService], // Exported so it can be used in ChatGateway or ChatService
})
export class MessageModule {}
