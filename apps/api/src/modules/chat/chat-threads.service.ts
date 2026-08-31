import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ChatThreadsService {
  constructor(private prisma: PrismaService) {}

  async getOrCreate(userId: string, otherUserId: string, jobPostId?: string) {
    if (userId === otherUserId) throw new BadRequestException('Cannot start a chat with yourself');

    const [me, other] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.user.findUnique({ where: { id: otherUserId } }),
    ]);
    if (!other || !me) throw new NotFoundException('User not found');

    // Orient clientId/providerId by actual role — either side can be the one who
    // clicks "Message" first (client browsing nearby providers, or a provider
    // following up after being hired).
    const clientId = me.role === 'PROVIDER' ? otherUserId : userId;
    const providerId = me.role === 'PROVIDER' ? userId : otherUserId;

    const existing = await this.prisma.chatThread.findFirst({
      where: { clientId, providerId, jobPostId: jobPostId ?? null },
    });
    if (existing) return existing;

    return this.prisma.chatThread.create({ data: { clientId, providerId, jobPostId } });
  }

  async listMine(userId: string) {
    const threads = await this.prisma.chatThread.findMany({
      where: { OR: [{ clientId: userId }, { providerId: userId }] },
      orderBy: { createdAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    return Promise.all(
      threads.map(async (t) => {
        const otherUserId = t.clientId === userId ? t.providerId : t.clientId;
        const other = await this.prisma.user.findUnique({
          where: { id: otherUserId },
          select: { name: true, avatar: true },
        });
        return {
          id: t.id,
          otherUser: { id: otherUserId, name: other?.name ?? 'User', avatar: other?.avatar ?? null },
          lastMessage: t.messages[0]?.content ?? null,
          lastMessageAt: t.messages[0]?.createdAt ?? t.createdAt,
        };
      }),
    );
  }

  async ensureParticipant(userId: string, threadId: string) {
    const thread = await this.prisma.chatThread.findUnique({ where: { id: threadId } });
    if (!thread) throw new NotFoundException('Conversation not found');
    if (thread.clientId !== userId && thread.providerId !== userId) throw new ForbiddenException();
    return thread;
  }
}