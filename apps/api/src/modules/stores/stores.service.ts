import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ReviewsService } from '../reviews/reviews.service';
import { ListLocalStoresDto } from './dto/list-local-stores.dto';
function serializeListing(l: any) {
  return {
    storeListingId: l.id,
    productId: l.product.id,
    title: l.product.title,
    canonicalSlug: l.product.canonicalSlug,
    image: l.product.images[0] ?? null,
    price: Number(l.price),
    compareAtPrice: l.compareAtPrice ? Number(l.compareAtPrice) : null,
    stock: l.stock,
    isBestDeal: l.isBestDeal,
    rating: l.rating,
    reviewCount: l.reviewCount,
  };
}

@Injectable()
export class StoresService {
  constructor(
    private prisma: PrismaService,
    private reviewsService: ReviewsService,
  ) {}

  topStores(limit = 6) {
    return this.prisma.store.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { rating: 'desc' },
      take: limit,
      select: { id: true, name: true, slug: true, logo: true, rating: true },
    });
  }

  async findBySlug(slug: string) {
    const store = await this.prisma.store.findUnique({
      where: { slug },
      include: { listings: { include: { product: true } } },
    });
    if (!store) throw new NotFoundException('Store not found');

    const followerCount = await this.prisma.storeFollow.count({ where: { storeId: store.id } });
    const ratingAgg = await this.prisma.review.aggregate({
      where: { storeListing: { storeId: store.id } },
      _avg: { rating: true },
      _count: true,
    });

    const products = store.listings.map(serializeListing);
    const deals = products.filter((p) => p.isBestDeal || p.compareAtPrice !== null);
    const reviews = await this.reviewsService.listByStore(store.id);

    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      logo: store.logo,
      banner: store.banner,
      description: store.description,
      category: store.category,
      status: store.status,
      rating: Number((ratingAgg._avg.rating ?? 0).toFixed(1)),
      reviewCount: ratingAgg._count,
      followerCount,
      products,
      deals,
      reviews,
    };
  }

  async toggleFollow(userId: string, storeId: string) {
    const existing = await this.prisma.storeFollow.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });
    if (existing) {
      await this.prisma.storeFollow.delete({ where: { id: existing.id } });
      return { following: false };
    }
    await this.prisma.storeFollow.create({ data: { userId, storeId } });
    return { following: true };
  }

  async isFollowing(userId: string, storeId: string) {
    const existing = await this.prisma.storeFollow.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });
    return { following: !!existing };
  }

    async logVisit(storeId: string, source: string) {
    await this.prisma.storeVisit.create({ data: { storeId, source } });
    return { ok: true };
  }

      async listLocal(query: ListLocalStoresDto) {
    const radiusKm = query.radiusKm ?? 10;

    let nearRows: { id: string; distance_km: number }[] | null = null;
    if (query.lat != null && query.lng != null) {
      nearRows = await this.prisma.$queryRaw<{ id: string; distance_km: number }[]>`
        SELECT id, earth_distance(ll_to_earth(${query.lat}, ${query.lng}), ll_to_earth(latitude, longitude)) / 1000 AS distance_km
        FROM stores
        WHERE status = 'ACTIVE' AND latitude IS NOT NULL AND longitude IS NOT NULL
          AND earth_box(ll_to_earth(${query.lat}, ${query.lng}), ${radiusKm * 1000}) @> ll_to_earth(latitude, longitude)
        ORDER BY distance_km ASC
        LIMIT 100
      `;
      if (nearRows.length === 0) return [];
    }

    const stores = await this.prisma.store.findMany({
      where: {
        status: 'ACTIVE',
        id: nearRows ? { in: nearRows.map((n) => n.id) } : undefined,
        city: query.city ? { contains: query.city, mode: 'insensitive' } : undefined,
        listings: query.categorySlug ? { some: { product: { category: { slug: query.categorySlug } } } } : undefined,
      },
      include: { listings: { take: 4, include: { product: true } }, _count: { select: { listings: true } } },
    });

    const distanceMap = new Map(nearRows?.map((n) => [n.id, n.distance_km]) ?? []);

    const shaped = stores.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      logo: s.logo,
      banner: s.banner,
      city: s.city,
      country: s.country,
      rating: s.rating,
      productCount: s._count.listings,
      previewProducts: s.listings.map((l) => ({ title: l.product.title, image: l.product.images[0] ?? null, price: Number(l.price) })),
      distanceKm: distanceMap.has(s.id) ? Number(distanceMap.get(s.id)!.toFixed(2)) : null,
    }));

    if (nearRows) shaped.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    return shaped;
  }
}