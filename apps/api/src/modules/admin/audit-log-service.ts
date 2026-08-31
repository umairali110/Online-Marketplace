import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(actorId: string, action: string, targetType: string, targetId?: string) {
    const actor = await this.prisma.user.findUnique({ where: { id: actorId }, select: { name: true } });
    await this.prisma.adminAction.create({
      data: { actorId, actorName: actor?.name ?? 'Admin', action, targetType, targetId },
    });
  }

  list(limit = 100) {
    return this.prisma.adminAction.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
  }
}