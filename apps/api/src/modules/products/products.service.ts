import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ListProductsDto } from './dto/list-product.dto';
import { CacheService } from 'src/common/cache/cache.service';

function serializeListing(listing: any) {
  return {
    ...listing,
    price: Number(listing.price),
    compareAtPrice: listing.compareAtPrice ? Number(listing.compareAtPrice) : null,
  };
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async list(query: ListProductsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: any = {};
    if (query.categorySlug) {
      where.category = { slug: query.categorySlug };
    }
    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }

    const products = await this.prisma.product.findMany({
      where,
      include: { listings: { orderBy: { price: 'asc' } }, category: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: query.sort === 'newest' ? { createdAt: 'desc' } : undefined,
    });

    const total = await this.prisma.product.count({ where });

    // Shape each product with its lowest price + rating for card display,
    // and sort in-memory for price/rating (since these live on the listing, not the product).
    let shaped = products.map((p) => {
      const listings = p.listings.map(serializeListing);
      const lowest = listings[0];
      const avgRating = listings.length
        ? listings.reduce((sum, l) => sum + l.rating, 0) / listings.length
        : 0;
      return {
        id: p.id,
        title: p.title,
        brand: p.brand,
        images: p.images,
        categorySlug: p.category.slug,
        canonicalSlug: p.canonicalSlug,
        lowestPrice: lowest?.price ?? null,
        compareAtPrice: lowest?.compareAtPrice ?? null,
        storeCount: listings.length,
        rating: Number(avgRating.toFixed(1)),
        isBestDeal: listings.some((l) => l.isBestDeal),
      };
    });

    if (query.sort === 'price_asc') shaped.sort((a, b) => (a.lowestPrice ?? 0) - (b.lowestPrice ?? 0));
    if (query.sort === 'price_desc') shaped.sort((a, b) => (b.lowestPrice ?? 0) - (a.lowestPrice ?? 0));
    if (query.sort === 'rating') shaped.sort((a, b) => b.rating - a.rating);

    return { data: shaped, total, page, limit };
  }

    async bestDeals(limit = 8) {
    const cacheKey = `best-deals:${limit}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const listings = await this.prisma.storeListing.findMany({
      where: { isBestDeal: true },
      include: { product: true, store: true },
      take: limit,
    });
    const shaped = listings.map((l) => ({
      id: l.product.id,
      title: l.product.title,
      images: l.product.images,
      canonicalSlug: l.product.canonicalSlug,
      price: Number(l.price),
      compareAtPrice: l.compareAtPrice ? Number(l.compareAtPrice) : null,
      rating: l.rating,
      storeName: l.store.name,
    }));
    await this.cache.set(cacheKey, shaped, 120); // 2 min TTL — deals change more often than categories
    return shaped;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { canonicalSlug: slug },
      include: {
        category: true,
        listings: {
          orderBy: { price: 'asc' },
          include: { store: true },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');

    return {
      id: product.id,
      title: product.title,
      brand: product.brand,
      images: product.images,
      canonicalSlug: product.canonicalSlug,
      category: product.category,
      // This listings array, sorted cheapest-first, IS the "Compare prices from N stores" table.
      listings: product.listings.map((l) => ({
        id: l.id,
        storeId: l.storeId,
        storeName: l.store.name,
        storeSlug: l.store.slug,
        price: Number(l.price),
        compareAtPrice: l.compareAtPrice ? Number(l.compareAtPrice) : null,
        stock: l.stock,
        isBestDeal: l.isBestDeal,
        freeDelivery: l.freeDelivery,
        rating: l.rating,
        reviewCount: l.reviewCount,
      })),
    };
  }

    async relatedTo(slug: string, limit = 8) {
    const product = await this.prisma.product.findUnique({ where: { canonicalSlug: slug } });
    if (!product) return [];

    const related = await this.prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id } },
      include: { listings: { orderBy: { price: 'asc' }, take: 1 } },
      take: limit,
    });

    return related
      .filter((p) => p.listings.length > 0)
      .map((p) => ({
        id: p.id,
        title: p.title,
        images: p.images,
        canonicalSlug: p.canonicalSlug,
        lowestPrice: Number(p.listings[0].price),
        rating: p.listings[0].rating,
      }));
  }
}