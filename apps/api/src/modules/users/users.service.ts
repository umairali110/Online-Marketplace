import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

function sanitize(user: any) {
  const { passwordHash, refreshTokenHash, otpCode, otpExpiresAt, ...rest } = user;
  return rest;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? sanitize(user) : null;
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({ where: { id }, data: dto });
    return sanitize(user);
  }

  async updateAvatar(id: string, avatarUrl: string) {
    const user = await this.prisma.user.update({ where: { id }, data: { avatar: avatarUrl } });
    return sanitize(user);
  }

  isProfileComplete(user: { phone: string | null; city: string | null; country: string | null }) {
    return !!(user.phone && user.city && user.country);
  }

    async getNotificationPreferences(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { notificationPreferences: true } });
    return { emailNewOrder: true, emailLowStock: true, emailJobUpdates: true, emailBackInStock: true, emailAbandonedCart: true, ...(user?.notificationPreferences as any) };
  }

  async updateNotificationPreferences(id: string, prefs: Record<string, boolean>) {
    const current = await this.getNotificationPreferences(id);
    const merged = { ...current, ...prefs };
    await this.prisma.user.update({ where: { id }, data: { notificationPreferences: merged } });
    return merged;
  }
}