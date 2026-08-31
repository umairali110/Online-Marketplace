import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminServiceCommissionsService {
  constructor(private prisma: PrismaService) {}

  async overview() {
    const commissions = await this.prisma.serviceCommission.findMany();
    const providerIds = [...new Set(commissions.map((c) => c.providerId))];
    const providers = await this.prisma.providerProfile.findMany({ where: { id: { in: providerIds } } });
    const providerUserIds = providers.map((p) => p.userId);
    const users = await this.prisma.user.findMany({ where: { id: { in: providerUserIds } }, select: { id: true, name: true } });

    const providerNameMap = new Map(
      providers.map((p) => [p.id, users.find((u) => u.id === p.userId)?.name ?? 'Provider']),
    );

    const totalOwed = commissions.filter((c) => c.status === 'OWED').reduce((sum, c) => sum + Number(c.amount), 0);

    const byProvider = new Map<string, { providerName: string; owed: number; settled: number }>();
    for (const c of commissions) {
      const existing = byProvider.get(c.providerId) ?? {
        providerName: providerNameMap.get(c.providerId) ?? 'Provider',
        owed: 0,
        settled: 0,
      };
      if (c.status === 'OWED') existing.owed += Number(c.amount);
      else existing.settled += Number(c.amount);
      byProvider.set(c.providerId, existing);
    }

    return {
      totalOwed,
      byProvider: Array.from(byProvider.entries()).map(([providerId, stats]) => ({ providerId, ...stats })),
    };
  }

  async settleForProvider(providerId: string) {
    const result = await this.prisma.serviceCommission.updateMany({
      where: { providerId, status: 'OWED' },
      data: { status: 'SETTLED' },
    });
    if (result.count === 0) throw new NotFoundException('No outstanding commission for this provider');
    return { message: `Settled ${result.count} commission record(s)` };
  }
}