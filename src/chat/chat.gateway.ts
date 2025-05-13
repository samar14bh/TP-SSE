// src/chat/chat.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from 'src/message/message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from 'src/message/entities/message.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly messageService: MessageService) {}

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(@MessageBody() createMessageDto: CreateMessageDto): Promise<void> {
    try {
      const message: Message = await this.messageService.sendMessage(
        createMessageDto.chatId,
        createMessageDto.senderId,
        createMessageDto.text,
        createMessageDto.image,
      );

      this.server.emit('new_message', {
        id: message.id,
        chatId: message.chat?.id,
        senderId: message.sender?.id,
        text: message.text,
        image: message.image,
        createdAt: message.createdAt,
      });
    } catch (error) {
      console.error('Error saving message:', error.message);
    }
  }
}
