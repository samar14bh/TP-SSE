import { IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  author: string;

  @IsString()
  content: string;
}
