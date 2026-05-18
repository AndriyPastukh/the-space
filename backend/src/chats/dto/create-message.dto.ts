import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  content: string;
}
