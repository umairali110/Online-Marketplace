import { Injectable, Logger } from '@nestjs/common';
import * as webpush from 'web-push';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PushService {
  private logger = new Logger(PushService.name);
  private configured = false;

  constructor(private prisma: PrismaService) {
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT!,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY,
      );
      this.configured = true;
    }
  }

  async subscribe(userId: string, sub: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    await this.prisma.pushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      update: { userId, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      create: { userId, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    });
    return { message: 'Subscribed' };
  }

  async unsubscribe(endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({ where: { endpoint } });
    return { message: 'Unsubscribed' };
  }

  async sendToUser(userId: string, title: string, body: string) {
    if (!this.configured) return; // push not set up — silently no-op, in-app + email still work

    const subs = await this.prisma.pushSubscription.findMany({ where: { userId } });
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title, body }),
        );
      } catch (err: any) {
        // 404/410 means the browser unsubscribed on its own — clean up the stale row.
        if (err.statusCode === 404 || err.statusCode === 410) {
          await this.prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        } else {
          this.logger.warn(`Push send failed: ${err.message}`);
        }
      }
    }
  }
}