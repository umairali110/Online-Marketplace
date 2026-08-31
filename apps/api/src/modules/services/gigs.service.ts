import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateGigDto } from './dto/create-gig.dto';
import { UpdateGigDto } from './dto/update-gig.dto';
import { DirectHireService } from './direct-hire.service';

function shapeGig(gig: any) {
  return {
    id: gig.id,
    title: gig.title,
    description: gig.description,
    price: Number(gig.price),
    deliveryDays: gig.deliveryDays,
    images: gig.images,
    status: gig.status,
    category: { id: gig.category.id, name: gig.category.name, slug: gig.category.slug },
    createdAt: gig.createdAt,
  };
}

@Injectable()
export class GigsService {
  constructor(
    private prisma: PrismaService,
    private directHireService: DirectHireService,
  ) {}

  private async getProviderOrThrow(userId: string) {
    const provider = await this.prisma.providerProfile.findUnique({ where: { userId } });
    if (!provider) throw new BadRequestException('Create your provider profile first');
    return provider;
  }

  async create(userId: string, dto: CreateGigDto) {
    const provider = await this.getProviderOrThrow(userId);
    const category = await this.prisma.serviceCategory.findUnique({ where: { slug: dto.categorySlug } });
    if (!category) throw new BadRequestException('Invalid category');

    const gig = await this.prisma.gig.create({
      data: {
        providerId: provider.id,
        categoryId: category.id,
        title: dto.title,
        description: dto.description,
        price: dto.price,
        deliveryDays: dto.deliveryDays,
        images: dto.images ?? [],
      },
      include: { category: true },
    });
    return shapeGig(gig);
  }

  async listMine(userId: string) {
    const provider = await this.getProviderOrThrow(userId);
    const gigs = await this.prisma.gig.findMany({
      where: { providerId: provider.id },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return gigs.map(shapeGig);
  }

  async update(userId: string, gigId: string, dto: UpdateGigDto) {
    const provider = await this.getProviderOrThrow(userId);
    const gig = await this.prisma.gig.findUnique({ where: { id: gigId } });
    if (!gig) throw new NotFoundException('Gig not found');
    if (gig.providerId !== provider.id) throw new ForbiddenException();

    const { categorySlug, ...rest } = dto;
    let categoryId: string | undefined;
    if (categorySlug) {
      const category = await this.prisma.serviceCategory.findUnique({ where: { slug: categorySlug } });
      if (!category) throw new BadRequestException('Invalid category');
      categoryId = category.id;
    }

    const updated = await this.prisma.gig.update({
      where: { id: gigId },
      data: { ...rest, categoryId },
      include: { category: true },
    });
    return shapeGig(updated);
  }

  async remove(userId: string, gigId: string) {
    const provider = await this.getProviderOrThrow(userId);
    const gig = await this.prisma.gig.findUnique({ where: { id: gigId } });
    if (!gig) throw new NotFoundException('Gig not found');
    if (gig.providerId !== provider.id) throw new ForbiddenException();

    await this.prisma.gig.delete({ where: { id: gigId } });
    return { message: 'Gig deleted' };
  }

  // --- Public / customer-facing browse ---

  async listByCategory(categorySlug: string) {
    const gigs = await this.prisma.gig.findMany({
      where: { status: 'ACTIVE', category: { slug: categorySlug } },
      include: { category: true, provider: true },
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(gigs.map((g) => this.shapeWithProvider(g)));
  }

  async findOne(gigId: string) {
    const gig = await this.prisma.gig.findUnique({
      where: { id: gigId },
      include: { category: true, provider: true },
    });
    if (!gig) throw new NotFoundException('Gig not found');
    return this.shapeWithProvider(gig);
  }

  async hireFromGig(userId: string, gigId: string) {
    const gig = await this.prisma.gig.findUnique({ where: { id: gigId }, include: { category: true, provider: true } });
    if (!gig) throw new NotFoundException('Gig not found');
    if (gig.status !== 'ACTIVE') throw new BadRequestException('This gig is not currently active');

    return this.directHireService.hire(userId, {
      providerId: gig.providerId,
      title: gig.title,
      description: gig.description,
      categorySlug: gig.category.slug,
      budget: Number(gig.price),
    });
  }

  private async shapeWithProvider(gig: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: gig.provider.userId },
      select: { name: true, avatar: true },
    });
    return {
      ...shapeGig(gig),
      provider: {
        id: gig.provider.id,
        name: user?.name ?? 'Provider',
        avatar: user?.avatar ?? null,
        ratingAvg: gig.provider.ratingAvg,
        ratingCount: gig.provider.ratingCount,
        verified: gig.provider.verified,
        city: gig.provider.city,
      },
    };
  }
}