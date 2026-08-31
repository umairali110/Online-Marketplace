import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../database/prisma.service';
import { AddressesService } from '../addresses/addresses.service';
import { TrackingService } from '../tracking/tracking.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SellerWorkflowsService } from '../seller/seller-workflows.service';
import { RiskService } from '../risk/risk.service';
import { CouponsService } from '../coupons/coupons.service';

describe('OrdersService.checkout — stock guard', () => {
  it('rejects the order (and never oversells) when stock runs out mid-transaction', async () => {
    const mockTx = {
      order: { create: jest.fn().mockResolvedValue({ id: 'order1' }) },
      subOrder: { create: jest.fn().mockResolvedValue({ id: 'sub1' }) },
      orderItem: { createMany: jest.fn() },
      commission: { create: jest.fn() },
      // count: 0 simulates the exact race condition Phase 1 fixed — another
      // checkout already consumed the last unit between our pre-check and this write.
      storeListing: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
      user: { update: jest.fn() },
      cartItem: { deleteMany: jest.fn() },
      coupon: { update: jest.fn() },
      couponRedemption: { create: jest.fn() },
    };

    const prisma = {
      cart: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'cart1',
          items: [
            {
              storeListingId: 'listing1',
              qty: 1,
              storeListing: {
                storeId: 'store1',
                price: 50,
                stock: 1,
                store: { sellerId: 'seller1', name: 'Test Store' },
                product: { title: 'Test Product' },
              },
            },
          ],
        }),
      },
      user: { findUnique: jest.fn().mockResolvedValue({ trustCoins: 0 }) },
      $transaction: jest.fn((cb: any) => cb(mockTx)),
    };

    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: AddressesService, useValue: { ensureOwned: jest.fn().mockResolvedValue({ country: 'Pakistan' }) } },
        { provide: TrackingService, useValue: { scheduleForOrder: jest.fn() } },
        { provide: NotificationsService, useValue: { create: jest.fn() } },
        { provide: SellerWorkflowsService, useValue: { isActiveForStore: jest.fn().mockResolvedValue(false) } },
        { provide: RiskService, useValue: { evaluateOrder: jest.fn() } },
        { provide: CouponsService, useValue: { validate: jest.fn() } },
      ],
    }).compile();

    const service = module.get(OrdersService);

    await expect(service.checkout('user1', 'address1')).rejects.toThrow(BadRequestException);
    expect(mockTx.storeListing.updateMany).toHaveBeenCalledWith({
      where: { id: 'listing1', stock: { gte: 1 } },
      data: { stock: { decrement: 1 } },
    });
  });
});