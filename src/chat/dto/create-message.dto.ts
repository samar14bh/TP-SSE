import { IsString } from 'class-validator';

export class CreateMessageDto {
   senderId: string;
  receiverId: string;
  content: string;
}
