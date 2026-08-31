import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatMessagesService {
  constructor(
    private prisma: PrismaService,
    private gateway: ChatGateway,
  ) {}

  list(threadId: string) {
    return this.prisma.chatMessage.findMany({ where: { threadId }, orderBy: { createdAt: 'asc' } });
  }

  async send(threadId: string, senderId: string, content: string) {
    const message = await this.prisma.chatMessage.create({ data: { threadId, senderId, content } });
    this.gateway.emitMessage(threadId, message);
    return message;
  }
}