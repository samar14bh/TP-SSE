import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Message } from './entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reaction } from './entities/reaction.entity';
import { TypingGateway } from './typing.gatway';

@Module({
  providers: [ChatGateway, ChatService,TypingGateway],
  imports: [TypeOrmModule.forFeature([Message,Reaction])],
})
export class ChatModule {}
