import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCouponDto) {
    const code = dto.code.toUpperCase();
    const existing = await this.prisma.coupon.findUnique({ where: { code } });
    if (existing) throw new BadRequestException('Coupon code already exists');

    return this.prisma.coupon.create({
      data: {
        code,
        type: dto.type,
        value: dto.value,
        minOrderAmount: dto.minOrderAmount,
        maxUses: dto.maxUses,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  list() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async setActive(id: string, isActive: boolean) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return this.prisma.coupon.update({ where: { id }, data: { isActive } });
  }

  // Validation only — actual redemption (usedCount increment + CouponRedemption
  // row) happens inside the checkout transaction in OrdersService, so a coupon
  // can never be "validated but not actually consumed" if checkout later fails.
  async validate(code: string, userId: string, orderSubtotal: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.isActive) throw new BadRequestException('Invalid or inactive coupon');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new BadRequestException('This coupon has expired');
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new BadRequestException('This coupon has reached its usage limit');
    if (coupon.minOrderAmount && orderSubtotal < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(`This coupon requires a minimum order of $${Number(coupon.minOrderAmount).toFixed(0)}`);
    }

    const alreadyUsed = await this.prisma.couponRedemption.findFirst({ where: { couponId: coupon.id, userId } });
    if (alreadyUsed) throw new BadRequestException('You have already used this coupon');

    const discount =
      coupon.type === 'PERCENTAGE' ? orderSubtotal * (Number(coupon.value) / 100) : Number(coupon.value);

    return { coupon, discount: Math.min(discount, orderSubtotal) };
  }
}