import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProviderDirectoryService {
  constructor(private prisma: PrismaService) {}

  async listByCategory(categorySlug: string) {
    const providers = await this.prisma.providerProfile.findMany({
      where: { categories: { some: { slug: categorySlug } } },
      include: { categories: true },
      orderBy: { ratingAvg: 'desc' },
    });

    return Promise.all(
      providers.map(async (p) => {
        const user = await this.prisma.user.findUnique({ where: { id: p.userId }, select: { name: true, avatar: true } });
        return {
          providerId: p.id,
          userId: p.userId,
          name: user?.name ?? 'Provider',
          avatar: user?.avatar ?? null,
          bio: p.bio,
          skills: p.skills,
          city: p.city,
          country: p.country,
          ratingAvg: p.ratingAvg,
          ratingCount: p.ratingCount,
          verified: p.verified,
          categories: p.categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
        };
      }),
    );
  }

  async findPublicProfile(providerId: string) {
    const provider = await this.prisma.providerProfile.findUnique({
      where: { id: providerId },
      include: { categories: true },
    });
    if (!provider) throw new NotFoundException('Provider not found');

    const [user, gigs] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: provider.userId }, select: { name: true, avatar: true } }),
      this.prisma.gig.findMany({
        where: { providerId: provider.id, status: 'ACTIVE' },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      providerId: provider.id,
      userId: provider.userId,
      name: user?.name ?? 'Provider',
      avatar: user?.avatar ?? null,
      bio: provider.bio,
      skills: provider.skills,
      city: provider.city,
      country: provider.country,
      ratingAvg: provider.ratingAvg,
      ratingCount: provider.ratingCount,
      verified: provider.verified,
      categories: provider.categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      gigs: gigs.map((g) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        price: Number(g.price),
        deliveryDays: g.deliveryDays,
        images: g.images,
        category: { id: g.category.id, name: g.category.name, slug: g.category.slug },
      })),
    };
  }
}