import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from 'src/message/entities/message.entity';
import { User } from 'src/user/entities/user.entity';
import { ChatService } from './chat.service';
import { MessageService } from 'src/message/message.service';
import { ChatGateway } from './chat.gateway';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message, User]), MessageModule],
  providers: [ChatService, MessageService, ChatGateway],
})
export class ChatModule {}
