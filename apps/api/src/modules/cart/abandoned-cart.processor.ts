import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { SmtpService } from '../auth/email/smtp.service';

const ABANDON_THRESHOLD_HOURS = 24;

@Injectable()
export class AbandonedCartProcessor {
  private logger = new Logger(AbandonedCartProcessor.name);

  constructor(
    private prisma: PrismaService,
    private smtp: SmtpService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sendReminders() {
    const cutoff = new Date(Date.now() - ABANDON_THRESHOLD_HOURS * 60 * 60 * 1000);

    const staleCarts = await this.prisma.cart.findMany({
      where: {
        updatedAt: { lt: cutoff },
        reminderSentAt: null,
        items: { some: {} },
      },
      include: {
        user: true,
        items: { include: { storeListing: { include: { product: true } } }, take: 3 },
      },
    });

    for (const cart of staleCarts) {
      if (!cart.user.notificationPreferences || (cart.user.notificationPreferences as any).emailAbandonedCart === false) {
        await this.prisma.cart.update({ where: { id: cart.id }, data: { reminderSentAt: new Date() } });
        continue;
      }

      const itemNames = cart.items.map((i) => i.storeListing.product.title).join(', ');
      await this.smtp.sendPlainEmail(
        cart.user.email,
        'You left something in your cart',
        `Hi ${cart.user.name}, you still have ${itemNames} waiting in your cart. Complete your order before it sells out!`,
      );
      await this.prisma.cart.update({ where: { id: cart.id }, data: { reminderSentAt: new Date() } });
      this.logger.log(`Abandoned cart reminder sent to ${cart.user.email}`);
    }
  }
}