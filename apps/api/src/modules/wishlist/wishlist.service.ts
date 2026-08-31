import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    const items = await this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        storeListing: {
          include: { product: true, store: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((w) => ({
      wishlistId: w.id,
      storeListingId: w.storeListingId,
      productTitle: w.storeListing.product.title,
      productSlug: w.storeListing.product.canonicalSlug,
      productImage: w.storeListing.product.images[0] ?? null,
      storeName: w.storeListing.store.name,
      price: Number(w.storeListing.price),
    }));
  }

  // Just the raw IDs — cheap call the product page uses to paint filled/empty hearts.
  async listIds(userId: string) {
    const items = await this.prisma.wishlist.findMany({
      where: { userId },
      select: { storeListingId: true },
    });
    return items.map((i) => i.storeListingId);
  }

  async toggle(userId: string, storeListingId: string) {
    const existing = await this.prisma.wishlist.findUnique({
      where: { userId_storeListingId: { userId, storeListingId } },
    });

    if (existing) {
      await this.prisma.wishlist.delete({ where: { id: existing.id } });
      return { wishlisted: false };
    }

    await this.prisma.wishlist.create({ data: { userId, storeListingId } });
    return { wishlisted: true };
  }
}