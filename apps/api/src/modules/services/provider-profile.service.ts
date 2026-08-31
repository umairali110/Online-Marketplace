import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AiService } from 'src/modules/ai/ai.service';
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto';

function shape(profile: any) {
  return {
    id: profile.id,
    bio: profile.bio,
    skills: profile.skills,
    tags: profile.tags,
    city: profile.city,
    country: profile.country,
    ratingAvg: profile.ratingAvg,
    ratingCount: profile.ratingCount,
    verified: profile.verified,
    categories: profile.categories?.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })) ?? [],
    createdAt: profile.createdAt,
  };
}

@Injectable()
export class ProviderProfileService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async getMine(userId: string) {
    const profile = await this.prisma.providerProfile.findUnique({
      where: { userId },
      include: { categories: true },
    });
    return profile ? shape(profile) : null;
  }

    async create(userId: string, dto: CreateProviderProfileDto) {
    const existing = await this.prisma.providerProfile.findUnique({ where: { userId } });
    if (existing) throw new BadRequestException('Provider profile already exists');

    const categories = await this.prisma.serviceCategory.findMany({
      where: { slug: { in: dto.categorySlugs } },
    });
    if (categories.length === 0) throw new BadRequestException('Select at least one valid category');

    const profile = await this.prisma.providerProfile.create({
      data: {
        userId,
        bio: dto.bio,
        skills: dto.skills ?? [],
        tags: dto.skills ?? [],
        city: dto.city,
        country: dto.country,
        latitude: dto.latitude,
        longitude: dto.longitude,
        categories: { connect: categories.map((c) => ({ id: c.id })) },
      },
      include: { categories: true },
    });
    return shape(profile);
  }

  async extractFromVoice(transcript: string) {
    const categories = await this.prisma.serviceCategory.findMany();
    const slugs = categories.map((c) => c.slug);
    const result = await this.aiService.extractProviderProfile(transcript, slugs);
    return {
      bio: result.bio,
      skills: result.skills,
      matchedCategories: categories
        .filter((c) => result.matchedCategorySlugs.includes(c.slug))
        .map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    };
  }
}