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
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
    this.loadInitialMessages();
  }

  async loadInitialMessages() {
    try {
      const messages = await this.chatService.getAllMessages();
      this.server.emit('load_messages', messages);
    } catch (error) {
      console.error('Error loading initial messages:', error);
    }
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.chatService.getAllMessages()
      .then(messages => {
        client.emit('load_messages', messages);
      })
      .catch(error => {
        console.error('Error sending initial messages:', error);
      });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
  ) {
    try {
      const { author, content } = createMessageDto;
      const message = await this.chatService.saveMessage(author, content);
      this.server.emit('new_message', message);
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  @SubscribeMessage('add_reaction')
  async handleAddReaction(
    @MessageBody() data: { messageId: number; emoji: string; userId: string }
  ) {
    const message = await this.chatService.addReaction(
      data.messageId,
      data.emoji,
      data.userId
    );
    this.server.emit('message_updated', message);
  }

  @SubscribeMessage('remove_reaction')
  async handleRemoveReaction(
    @MessageBody() data: { messageId: number; userId: string }
  ) {
    const message = await this.chatService.removeReaction(
      data.messageId,
      data.userId
    );
    this.server.emit('message_updated', message);
  }
}