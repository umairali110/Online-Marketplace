import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminRiskService {
  constructor(private prisma: PrismaService) {}

  async overview() {
    const [highRiskCount, mediumRiskCount, flags] = await Promise.all([
      this.prisma.riskFlag.count({ where: { level: 'HIGH' } }),
      this.prisma.riskFlag.count({ where: { level: 'MEDIUM' } }),
      this.prisma.riskFlag.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    ]);

    const byCountry = new Map<string, number>();
    for (const f of flags) {
      const c = f.country ?? 'Unknown';
      byCountry.set(c, (byCountry.get(c) ?? 0) + 1);
    }

    return {
      highRiskCount,
      mediumRiskCount,
      riskByCountry: Array.from(byCountry.entries()).map(([country, count]) => ({ country, count })),
      recentAlerts: flags.map((f) => ({
        id: f.id,
        level: f.level,
        reason: f.reason,
        country: f.country,
        createdAt: f.createdAt,
      })),
    };
  }
}