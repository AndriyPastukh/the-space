import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';

interface RequestWithUser {
  user: {
    id: number;
    email: string;
  };
}

@Controller('api/chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  async getChats(@Req() req: RequestWithUser) {
    return this.chatsService.findUserChats(req.user.id);
  }

  @Post('direct/:userId')
  async createDirectChat(
    @Req() req: RequestWithUser,
    @Param('userId', ParseIntPipe) recipientId: number,
  ) {
    return this.chatsService.getOrCreateDirectChat(req.user.id, recipientId);
  }

  @Get(':chatId/messages')
  async getMessages(
    @Req() req: RequestWithUser,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: number,
  ) {
    return this.chatsService.findChatMessages(chatId, req.user.id, {
      limit: limit ? Number(limit) : undefined,
      cursor: cursor ? Number(cursor) : undefined,
    });
  }

  @Post(':chatId/messages')
  async sendMessage(
    @Req() req: RequestWithUser,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.chatsService.sendMessage(chatId, req.user.id, createMessageDto);
  }

  @Patch(':chatId/read')
  async readChat(
    @Req() req: RequestWithUser,
    @Param('chatId', ParseIntPipe) chatId: number,
  ) {
    return this.chatsService.markAsRead(chatId, req.user.id);
  }
}
