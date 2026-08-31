import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminCommissionsService {
  constructor(private prisma: PrismaService) {}

  // "Payouts & Settlements" in design.md — flipped direction under COD: this is
  // commission the platform is OWED by each merchant, not money owed to them.
  async overview() {
    const commissions = await this.prisma.commission.findMany({
      include: { store: { select: { name: true, slug: true } } },
    });

    const totalOwed = commissions
      .filter((c) => c.status === 'OWED')
      .reduce((sum, c) => sum + Number(c.amount), 0);

    const byStore = new Map<string, { storeName: string; storeSlug: string; owed: number; settled: number }>();
    for (const c of commissions) {
      const existing = byStore.get(c.storeId) ?? {
        storeName: c.store.name,
        storeSlug: c.store.slug,
        owed: 0,
        settled: 0,
      };
      if (c.status === 'OWED') existing.owed += Number(c.amount);
      else existing.settled += Number(c.amount);
      byStore.set(c.storeId, existing);
    }

    return {
      totalOwed,
      byStore: Array.from(byStore.entries()).map(([storeId, stats]) => ({ storeId, ...stats })),
    };
  }

  async settleForStore(storeId: string) {
    const result = await this.prisma.commission.updateMany({
      where: { storeId, status: 'OWED' },
      data: { status: 'SETTLED' },
    });
    if (result.count === 0) throw new NotFoundException('No outstanding commission for this store');
    return { message: `Settled ${result.count} commission record(s)` };
  }
}