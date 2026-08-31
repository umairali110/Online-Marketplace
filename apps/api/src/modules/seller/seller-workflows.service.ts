import { Injectable } from '@nestjs/common';
import { WorkflowKey } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { SellerStoreService } from './seller-store.service';

const DEFAULT_KEYS: WorkflowKey[] = ['NEW_ORDER_EMAIL', 'NEW_ORDER_INVENTORY', 'LOW_STOCK_NOTIFY'];

@Injectable()
export class SellerWorkflowsService {
  constructor(
    private prisma: PrismaService,
    private sellerStoreService: SellerStoreService,
  ) {}

  async list(userId: string) {
    const store = await this.sellerStoreService.getMyStoreOrThrow(userId);

    // Ensure the 3 presets exist for this store (first-visit seeding).
    for (const key of DEFAULT_KEYS) {
      await this.prisma.workflow.upsert({
        where: { storeId_key: { storeId: store.id, key } },
        update: {},
        create: { storeId: store.id, key },
      });
    }

    return this.prisma.workflow.findMany({ where: { storeId: store.id }, orderBy: { key: 'asc' } });
  }

  async toggle(userId: string, key: WorkflowKey) {
    const store = await this.sellerStoreService.getMyStoreOrThrow(userId);
    const workflow = await this.prisma.workflow.findUnique({
      where: { storeId_key: { storeId: store.id, key } },
    });
    if (!workflow) throw new Error('Workflow not found');

    return this.prisma.workflow.update({
      where: { id: workflow.id },
      data: { isActive: !workflow.isActive },
    });
  }

  // Used internally by OrdersService — doesn't require the seller's own auth context.
  async isActiveForStore(storeId: string, key: WorkflowKey) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { storeId_key: { storeId, key } },
    });
    return workflow?.isActive ?? true; // default to on if not yet seeded
  }
}