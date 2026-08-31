import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

    async upsert(userId: string, dto: CreateReviewDto) {
    await this.prisma.review.upsert({
      where: { userId_storeListingId: { userId, storeListingId: dto.storeListingId } },
      update: { rating: dto.rating, comment: dto.comment, images: dto.images ?? [] },
      create: {
        userId,
        storeListingId: dto.storeListingId,
        rating: dto.rating,
        comment: dto.comment,
        images: dto.images ?? [],
      },
    });

    await this.recomputeListingRating(dto.storeListingId);
    return { message: 'Review saved' };
  }

  // Keeps StoreListing.rating/reviewCount as cheap cached fields (product cards & compare
  // table already read these) instead of aggregating reviews on every catalog request.
  private async recomputeListingRating(storeListingId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { storeListingId },
      _avg: { rating: true },
      _count: true,
    });

    await this.prisma.storeListing.update({
      where: { id: storeListingId },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewCount: agg._count,
      },
    });
  }

  async listByListing(storeListingId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { storeListingId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      userName: r.user.name,
      images: r.images,
    }));
  }

  async listByStore(storeId: string, limit = 20) {
    const reviews = await this.prisma.review.findMany({
      where: { storeListing: { storeId } },
      include: { user: { select: { name: true } }, storeListing: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      userName: r.user.name,
      productTitle: r.storeListing.product.title,
      images: r.images,
    }));
  }
}