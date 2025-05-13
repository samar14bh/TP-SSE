// src/message/dto/create-message.dto.ts

import { IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber } from 'class-validator';

export class CreateMessageDto {
  @IsNumber()
  @IsNotEmpty()
  chatId: number;

  @IsUUID()
  @IsNotEmpty()
  senderId: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  image?: string;
}
