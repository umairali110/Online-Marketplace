import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PlatformService {
  constructor(private prisma: PrismaService) {}

  async stats() {
    const [totalCustomers, totalStores, totalProviders, totalOrders] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.store.count({ where: { status: 'ACTIVE' } }),
      this.prisma.providerProfile.count(),
      this.prisma.order.count(),
    ]);
    return { totalCustomers, totalStores, totalProviders, totalOrders };
  }
}