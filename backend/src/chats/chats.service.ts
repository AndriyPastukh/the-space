import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyParticipant(chatId: number, userId: number) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: chatId,
          userId: userId,
        },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this chat');
    }

    return participant;
  }

  async findUserChats(currentUserId: number) {
    const participants = await this.prisma.chatParticipant.findMany({
      where: {
        userId: currentUserId,
      },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  include: {
                    userDetails: true,
                  },
                },
              },
            },
            messages: {
              where: {
                deletedAt: null,
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
        },
      },
    });

    const chats = await Promise.all(
      participants.map(async (cp) => {
        const conversation = cp.conversation;

        // Find other participant
        const otherCp = conversation.participants.find(
          (p) => p.userId !== currentUserId,
        );

        const otherUser = otherCp?.user;
        const otherDetails = otherUser?.userDetails;

        const lastMessage = conversation.messages[0] || null;

        // Calculate unread count
        // - messages in the current conversation
        // - messages created after the current user's lastReadAt
        // - messages not sent by current user
        // - messages where deletedAt is null
        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conversation.id,
            deletedAt: null,
            senderId: {
              not: currentUserId,
            },
            createdAt: {
              gt: cp.lastReadAt,
            },
          },
        });

        return {
          id: conversation.id,
          type: conversation.type,
          updatedAt: conversation.updatedAt,
          otherParticipant: otherDetails
            ? {
                id: otherDetails.userId,
                firstName: otherDetails.firstName,
                lastName: otherDetails.lastName,
                nickname: otherDetails.nickname,
                avatarUrl: otherDetails.avatarUrl,
              }
            : null,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
              }
            : null,
          unreadCount,
        };
      }),
    );

    // Sort by latest message/conversation activity desc
    return chats.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getOrCreateDirectChat(currentUserId: number, recipientId: number) {
    if (currentUserId === recipientId) {
      throw new BadRequestException('You cannot create a chat with yourself');
    }

    const recipientExists = await this.prisma.user.findUnique({
      where: { id: recipientId },
    });
    if (!recipientExists) {
      throw new NotFoundException('Recipient user not found');
    }

    // directKey from sorted IDs
    const directKey = [currentUserId, recipientId]
      .sort((a, b) => a - b)
      .join(':');

    // Attempt to find existing first
    const existing = await this.prisma.conversation.findUnique({
      where: { directKey },
    });

    if (existing) {
      return existing;
    }

    try {
      // Create new conversation with transaction
      return await this.prisma.conversation.create({
        data: {
          type: 'DIRECT',
          directKey,
          participants: {
            create: [{ userId: currentUserId }, { userId: recipientId }],
          },
        },
      });
    } catch (error) {
      const err = error as Record<string, any>;
      // In case of unique constraint violation (P2002) from concurrent requests,
      // fallback and query the existing one
      if (err && err.code === 'P2002') {
        const fallback = await this.prisma.conversation.findUnique({
          where: { directKey },
        });
        if (fallback) return fallback;
      }
      throw error;
    }
  }

  async findChatMessages(
    chatId: number,
    currentUserId: number,
    query: { limit?: number; cursor?: number },
  ) {
    await this.verifyParticipant(chatId, currentUserId);

    const limit = Math.min(Math.max(1, Number(query.limit) || 50), 100);
    const cursor = query.cursor ? Number(query.cursor) : undefined;

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId: chatId,
        deletedAt: null,
      },
      take: limit,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages.map((m) => ({
      id: m.id,
      chatId: m.conversationId,
      senderId: m.senderId,
      content: m.content,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      isMine: m.senderId === currentUserId,
    }));
  }

  async sendMessage(
    chatId: number,
    currentUserId: number,
    dto: CreateMessageDto,
  ) {
    await this.verifyParticipant(chatId, currentUserId);

    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          conversationId: chatId,
          senderId: currentUserId,
          content: dto.content,
        },
      }),
      this.prisma.conversation.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return {
      id: message.id,
      chatId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      isMine: true,
    };
  }

  async markAsRead(chatId: number, currentUserId: number) {
    await this.verifyParticipant(chatId, currentUserId);

    await this.prisma.chatParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: chatId,
          userId: currentUserId,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    return { success: true };
  }
}
