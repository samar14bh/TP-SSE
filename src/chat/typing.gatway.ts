import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway()
export class TypingGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @MessageBody() data: { userId: string; chatId: string },
    @ConnectedSocket() client: Socket
  ) {
    client.broadcast.emit('user_typing', {
      userId: data.userId,
      chatId: data.chatId,
      isTyping: true
    });
  }

  @SubscribeMessage('typing_end')
  handleTypingEnd(
    @MessageBody() data: { userId: string; chatId: string },
    @ConnectedSocket() client: Socket
  ) {
    client.broadcast.emit('user_typing', {
      userId: data.userId,
      chatId: data.chatId,
      isTyping: false
    });
  }
}