import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  async overview() {
    const [orders, activeMerchants, totalMerchants, totalCustomers] = await Promise.all([
      this.prisma.order.findMany({
        where: { status: 'PLACED' },
        include: { address: true },
      }),
      this.prisma.store.count({ where: { status: 'ACTIVE' } }),
      this.prisma.store.count(),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
    ]);

    const gmv = orders.reduce((sum, o) => sum + Number(o.total), 0);

    const gmvOverTime: { date: string; gmv: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayGmv = orders
        .filter((o) => o.createdAt.toISOString().slice(0, 10) === dateStr)
        .reduce((sum, o) => sum + Number(o.total), 0);
      gmvOverTime.push({ date: dateStr, gmv: dayGmv });
    }

    const countryCounts = new Map<string, { orders: number; gmv: number }>();
    for (const o of orders) {
      const country = o.address.country || 'Unknown';
      const existing = countryCounts.get(country) ?? { orders: 0, gmv: 0 };
      existing.orders += 1;
      existing.gmv += Number(o.total);
      countryCounts.set(country, existing);
    }
    const topCountries = Array.from(countryCounts.entries())
      .map(([country, stats]) => ({ country, ...stats }))
      .sort((a, b) => b.gmv - a.gmv)
      .slice(0, 5);

    return {
      gmv,
      activeMerchants,
      totalMerchants,
      totalCustomers,
      gmvOverTime,
      topCountries,
    };
  }
}