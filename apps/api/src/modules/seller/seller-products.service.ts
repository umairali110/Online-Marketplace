import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SellerStoreService } from './seller-store.service';
import { slugify } from 'src/common/utlis/slugify';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { paginate } from 'src/common/dto/pagination.dto';
function shape(listing: any) {
  return {
    storeListingId: listing.id,
    title: listing.product.title,
    brand: listing.product.brand,
    image: listing.product.images[0] ?? null,
    canonicalSlug: listing.product.canonicalSlug,
    price: Number(listing.price),
    compareAtPrice: listing.compareAtPrice ? Number(listing.compareAtPrice) : null,
    stock: listing.stock,
    isBestDeal: listing.isBestDeal,
    freeDelivery: listing.freeDelivery,
    rating: listing.rating,
    reviewCount: listing.reviewCount,
    createdAt: listing.createdAt,
  };
}

@Injectable()
export class SellerProductsService {
  constructor(
    private prisma: PrismaService,
    private sellerStoreService: SellerStoreService,
    private notificationsService: NotificationsService,
  ) {}

    async list(userId: string, page = 1, limit = 20) {
    const store = await this.sellerStoreService.getMyStoreOrThrow(userId);
    const [listings, total] = await Promise.all([
      this.prisma.storeListing.findMany({
        where: { storeId: store.id },
        include: { product: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.storeListing.count({ where: { storeId: store.id } }),
    ]);
    return paginate(listings.map(shape), total, page, limit);
  }

  async create(userId: string, dto: CreateProductDto) {
    const store = await this.sellerStoreService.getMyStoreOrThrow(userId);

    const category = await this.prisma.category.findUnique({ where: { slug: dto.categorySlug } });
    if (!category) throw new NotFoundException('Category not found');

    // MVP simplification: each seller-added product becomes its own canonical Product
    // (no global "pick an existing catalog item" picker yet) — cross-store price
    // comparison still works whenever two sellers happen to add the exact same seeded
    // product, as in the Day 2 seed data. A shared-catalog matching flow is a
    // reasonable phase-2 add if sellers start listing identical items often.
    const baseSlug = slugify(`${dto.title}-${store.slug}`);
    let canonicalSlug = baseSlug;
    let suffix = 1;
    while (await this.prisma.product.findUnique({ where: { canonicalSlug } })) {
      canonicalSlug = `${baseSlug}-${suffix++}`;
    }

    const product = await this.prisma.product.create({
      data: {
        categoryId: category.id,
        title: dto.title,
        brand: dto.brand,
        images: dto.images?.length ? dto.images : [`https://placehold.co/600x600?text=${encodeURIComponent(dto.title)}`],
        canonicalSlug,
      },
    });

    const listing = await this.prisma.storeListing.create({
      data: {
        storeId: store.id,
        productId: product.id,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        stock: dto.stock,
      },
      include: { product: true },
    });

    return shape(listing);
  }

      async update(userId: string, storeListingId: string, dto: UpdateProductDto) {
    const store = await this.sellerStoreService.getMyStoreOrThrow(userId);
    const listing = await this.prisma.storeListing.findUnique({ where: { id: storeListingId }, include: { product: true } });
    if (!listing) throw new NotFoundException('Product not found');
    if (listing.storeId !== store.id) throw new ForbiddenException();

    const { images, ...listingFields } = dto;

    if (images && images.length > 0) {
      await this.prisma.product.update({ where: { id: listing.productId }, data: { images } });
    }

    const updated = await this.prisma.storeListing.update({
      where: { id: storeListingId },
      data: listingFields,
      include: { product: true },
    });

    // Restock alert: only fires on the 0 -> positive transition, never on every
    // stock edit, so wishlisting users get exactly one "back in stock" ping.
    if (listing.stock === 0 && updated.stock > 0) {
      const wishlisters = await this.prisma.wishlist.findMany({ where: { storeListingId } });
      for (const w of wishlisters) {
        await this.notificationsService.create(
          w.userId,
          'BACK_IN_STOCK',
          'Back in stock!',
          `${listing.product.title} from ${store.name} is back in stock.`,
        );
      }
    }

    return shape(updated);
  }

  async remove(userId: string, storeListingId: string) {
    const store = await this.sellerStoreService.getMyStoreOrThrow(userId);
    const listing = await this.prisma.storeListing.findUnique({ where: { id: storeListingId } });
    if (!listing) throw new NotFoundException('Product not found');
    if (listing.storeId !== store.id) throw new ForbiddenException();

    await this.prisma.storeListing.delete({ where: { id: storeListingId } });
    return { message: 'Product deleted' };
  }
}