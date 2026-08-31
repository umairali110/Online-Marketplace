import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminProvidersService {
  constructor(private prisma: PrismaService) {}

  async list() {
    const providers = await this.prisma.providerProfile.findMany({
      include: { categories: true },
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(
      providers.map(async (p) => {
        const user = await this.prisma.user.findUnique({ where: { id: p.userId }, select: { name: true, email: true } });
        return {
          id: p.id,
          name: user?.name ?? 'Provider',
          email: user?.email ?? '',
          city: p.city,
          country: p.country,
          skills: p.skills,
          categories: p.categories.map((c) => c.name),
          ratingAvg: p.ratingAvg,
          verified: p.verified,
          createdAt: p.createdAt,
        };
      }),
    );
  }

  async setVerified(id: string, verified: boolean) {
    const provider = await this.prisma.providerProfile.findUnique({ where: { id } });
    if (!provider) throw new NotFoundException('Provider not found');
    return this.prisma.providerProfile.update({ where: { id }, data: { verified } });
  }
}