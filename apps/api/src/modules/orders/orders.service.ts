import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AddressesService } from '../addresses/addresses.service';
import { TrackingService } from '../tracking/tracking.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SellerWorkflowsService } from '../seller/seller-workflows.service';
import { RiskService } from '../risk/risk.service';
import { SmtpService } from '../auth/email/smtp.service';
import { CouponsService } from '../coupons/coupons.service';
import { computeOrderTotals } from './order-math';

const COMMISSION_RATE = Number(process.env.COMMISSION_RATE ?? '0.1');
const TRUST_COIN_RATE = 0.05;
const LOW_STOCK_THRESHOLD = 5;

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private addressesService: AddressesService,
    private trackingService: TrackingService,
    private notificationsService: NotificationsService,
    private workflowsService: SellerWorkflowsService,
    private riskService: RiskService,
    private smtpService: SmtpService,
    private couponsService: CouponsService,
  ) {}

  async checkout(userId: string, addressId: string, couponCode?: string, trustCoinsToRedeem = 0) {
    const address = await this.addressesService.ensureOwned(userId, addressId);

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { storeListing: { include: { store: true, product: true } } } } },
    });
    if (!cart || cart.items.length === 0) throw new BadRequestException('Cart is empty');

    for (const item of cart.items) {
      if (item.storeListing.stock < item.qty) {
        throw new BadRequestException('Not enough stock for one of the items in your cart');
      }
    }

    const byStore = new Map<string, typeof cart.items>();
    for (const item of cart.items) {
      const list = byStore.get(item.storeListing.storeId) ?? [];
      list.push(item);
      byStore.set(item.storeListing.storeId, list);
    }

    const subtotal = cart.items.reduce((sum, i) => sum + Number(i.storeListing.price) * i.qty, 0);
    const shipping = 0;
    const tax = 0;

    let couponDiscount = 0;
    let redeemedCouponId: string | null = null;
    if (couponCode) {
      const { coupon, discount } = await this.couponsService.validate(couponCode, userId, subtotal);
      couponDiscount = discount;
      redeemedCouponId = coupon.id;
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const { trustCoinsUsed, total, trustCoinsEarned } = computeOrderTotals({
      subtotal,
      shipping,
      tax,
      couponDiscount,
      trustCoinsAvailable: user?.trustCoins ?? 0,
      trustCoinsRequested: Math.max(0, trustCoinsToRedeem ?? 0),
      trustCoinRate: TRUST_COIN_RATE,
    });

    const lowStockAlerts: { storeId: string; sellerId: string; storeName: string; productTitle: string; stock: number }[] = [];
    const newOrderAlerts: { storeId: string; sellerId: string; storeName: string }[] = [];

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          subtotal,
          shipping,
          tax,
          total,
          paymentMethod: 'COD',
          trustCoinsEarned,
          couponCode: redeemedCouponId ? couponCode!.toUpperCase() : null,
          couponDiscount,
          trustCoinsUsed,
        },
      });

      if (redeemedCouponId) {
        await tx.coupon.update({ where: { id: redeemedCouponId }, data: { usedCount: { increment: 1 } } });
        await tx.couponRedemption.create({
          data: { couponId: redeemedCouponId, userId, orderId: createdOrder.id },
        });
      }

      for (const [storeId, items] of byStore) {
        const subOrderSubtotal = items.reduce((sum, i) => sum + Number(i.storeListing.price) * i.qty, 0);
        const subOrder = await tx.subOrder.create({ data: { orderId: createdOrder.id, storeId } });

        await tx.orderItem.createMany({
          data: items.map((i) => ({
            subOrderId: subOrder.id,
            storeListingId: i.storeListingId,
            qty: i.qty,
            price: i.storeListing.price,
          })),
        });

        await tx.commission.create({
          data: { storeId, subOrderId: subOrder.id, amount: subOrderSubtotal * COMMISSION_RATE },
        });

        const sellerId = items[0].storeListing.store.sellerId;
        const storeName = items[0].storeListing.store.name;
        newOrderAlerts.push({ storeId, sellerId, storeName });

        for (const i of items) {
          const result = await tx.storeListing.updateMany({
            where: { id: i.storeListingId, stock: { gte: i.qty } },
            data: { stock: { decrement: i.qty } },
          });
          if (result.count === 0) {
            throw new BadRequestException(
              `${i.storeListing.product.title} just sold out — please update your cart.`,
            );
          }

          const updatedListing = await tx.storeListing.findUniqueOrThrow({ where: { id: i.storeListingId } });
          if (updatedListing.stock < LOW_STOCK_THRESHOLD) {
            lowStockAlerts.push({
              storeId,
              sellerId,
              storeName,
              productTitle: i.storeListing.product.title,
              stock: updatedListing.stock,
            });
          }
        }
      }

      await tx.user.update({
        where: { id: userId },
        data: { trustCoins: { increment: trustCoinsEarned - trustCoinsUsed } },
      });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return createdOrder;
    });

    await this.trackingService.scheduleForOrder(order.id);
    await this.riskService.evaluateOrder(order.id, userId, total, address.country);

    for (const alert of newOrderAlerts) {
      await this.notificationsService.create(
        alert.sellerId,
        'NEW_ORDER',
        'New order received',
        `You have a new order on ${alert.storeName}.`,
      );
    }
    for (const alert of lowStockAlerts) {
      await this.notificationsService.create(
        alert.sellerId,
        'LOW_STOCK',
        'Low stock alert',
        `${alert.productTitle} is down to ${alert.stock} units.`,
      );
    }

    for (const alert of newOrderAlerts) {
      const active = await this.workflowsService.isActiveForStore(alert.storeId, 'NEW_ORDER_EMAIL');
      if (active) {
        const seller = await this.prisma.user.findUnique({ where: { id: alert.sellerId } });
        if (seller && (await this.emailAllowed(seller.id, 'emailNewOrder'))) {
          await this.smtpService.sendPlainEmail(
            seller.email,
            `New order on ${alert.storeName}`,
            `You have a new order on ${alert.storeName}. Log in to your seller dashboard to view details.`,
          );
        }
      }
    }
    for (const alert of lowStockAlerts) {
      const active = await this.workflowsService.isActiveForStore(alert.storeId, 'LOW_STOCK_NOTIFY');
      if (active) {
        const seller = await this.prisma.user.findUnique({ where: { id: alert.sellerId } });
        if (seller && (await this.emailAllowed(seller.id, 'emailLowStock'))) {
          await this.smtpService.sendPlainEmail(
            seller.email,
            `Low stock: ${alert.productTitle}`,
            `${alert.productTitle} on ${alert.storeName} is down to ${alert.stock} units.`,
          );
        }
      }
    }

    return this.findOne(userId, order.id);
  }

  async list(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { subOrders: { include: { store: true, items: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((o) => this.shape(o));
  }

  async findOne(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        address: true,
        subOrders: {
          include: { store: true, items: { include: { storeListing: { include: { product: true } } } } },
        },
      },
    });
    if (!order || order.userId !== userId) throw new NotFoundException('Order not found');
    return this.shape(order);
  }

  private async emailAllowed(userId: string, key: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { notificationPreferences: true } });
    const prefs = (user?.notificationPreferences as any) ?? {};
    return prefs[key] !== false;
  }

  private shape(order: any) {
    return {
      id: order.id,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      tax: Number(order.tax),
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      status: order.status,
      trustCoinsEarned: order.trustCoinsEarned,
      couponCode: order.couponCode,
      couponDiscount: Number(order.couponDiscount),
      trustCoinsUsed: order.trustCoinsUsed,
      createdAt: order.createdAt,
      address: order.address,
      subOrders: order.subOrders.map((so: any) => ({
        id: so.id,
        storeName: so.store.name,
        storeSlug: so.store.slug,
        trackingStatus: so.trackingStatus,
        items: so.items.map((it: any) => ({
          title: it.storeListing?.product?.title,
          qty: it.qty,
          price: Number(it.price),
        })),
      })),
    };
  }
}