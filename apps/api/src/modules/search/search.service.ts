import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(rawQuery: string) {
    const q = (rawQuery ?? '').trim();
    if (q.length < 2) return { products: [], stores: [], gigs: [] };

    const [products, stores, gigs] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { brand: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: { listings: { orderBy: { price: 'asc' }, take: 1 } },
        take: 8,
      }),
      this.prisma.store.findMany({
        where: { status: 'ACTIVE', name: { contains: q, mode: 'insensitive' } },
        take: 5,
      }),
      this.prisma.gig.findMany({
        where: { status: 'ACTIVE', title: { contains: q, mode: 'insensitive' } },
        include: { provider: true, category: true },
        take: 5,
      }),
    ]);

    const gigsShaped = await Promise.all(
      gigs.map(async (g) => {
        const user = await this.prisma.user.findUnique({ where: { id: g.provider.userId }, select: { name: true } });
        return {
          id: g.id,
          title: g.title,
          price: Number(g.price),
          providerId: g.provider.id,
          providerName: user?.name ?? 'Provider',
          category: g.category.name,
        };
      }),
    );

    return {
      products: products.map((p) => ({
        id: p.id,
        title: p.title,
        image: p.images[0] ?? null,
        canonicalSlug: p.canonicalSlug,
        lowestPrice: p.listings[0] ? Number(p.listings[0].price) : null,
      })),
      stores: stores.map((s) => ({ id: s.id, name: s.name, slug: s.slug, logo: s.logo })),
      gigs: gigsShaped,
    };
  }
}