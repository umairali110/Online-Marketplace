import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { PushService } from '../push/push.service';

@Injectable()
export class NotificationsService {
    constructor(
    private prisma: PrismaService,
    private pushService: PushService,
  ) {}

  async create(userId: string, type: NotificationType, title: string, body: string) {
    const notification = await this.prisma.notification.create({ data: { userId, type, title, body } });
    await this.pushService.sendToUser(userId, title, body);
    return notification;
  }

  list(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  unreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, readAt: null } });
  }

  async markRead(userId: string, id: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
    return { message: 'Marked as read' };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { message: 'All marked as read' };
  }
}