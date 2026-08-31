import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SellerStoreService } from './seller-store.service';

@Injectable()
export class SellerAnalyticsService {
  constructor(
    private prisma: PrismaService,
    private sellerStoreService: SellerStoreService,
  ) {}

  async overview(userId: string) {
    const store = await this.sellerStoreService.getMyStoreOrThrow(userId);
    const subOrders = await this.prisma.subOrder.findMany({
      where: { storeId: store.id },
      include: { items: true, order: true },
    });

    const revenue = subOrders.reduce(
      (sum, so) => sum + so.items.reduce((s, i) => s + Number(i.price) * i.qty, 0),
      0,
    );
    const orderCount = subOrders.length;
    const customerCount = new Set(subOrders.map((so) => so.order.userId)).size;

    const salesOverTime: { date: string; revenue: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayRevenue = subOrders
        .filter((so) => so.createdAt.toISOString().slice(0, 10) === dateStr)
        .reduce((sum, so) => sum + so.items.reduce((s, i) => s + Number(i.price) * i.qty, 0), 0);
      salesOverTime.push({ date: dateStr, revenue: dayRevenue });
    }

    const visits = await this.prisma.storeVisit.findMany({ where: { storeId: store.id } });
    const visitorCount = visits.length;
    const bySource = new Map<string, number>();
    for (const v of visits) {
      bySource.set(v.source, (bySource.get(v.source) ?? 0) + 1);
    }
    const trafficSource = Array.from(bySource.entries()).map(([source, count]) => ({ source, count }));

    const conversionRate =
      visitorCount > 0 ? Number(((orderCount / visitorCount) * 100).toFixed(1)) : null;

    return {
      storeStatus: store.status,
      revenue,
      orderCount,
      customerCount,
      visitorCount,
      conversionRate,
      salesOverTime,
      trafficSource,
    };
  }
}