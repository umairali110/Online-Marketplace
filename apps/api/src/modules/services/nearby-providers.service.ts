import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ListNearbyProvidersDto } from './dto/list-nearby-providers.dto';

const DEFAULT_RADIUS_KM = 5;

interface RawNearbyRow {
  id: string;
  userId: string;
  bio: string | null;
  skills: string[];
  city: string | null;
  country: string | null;
  ratingAvg: number;
  ratingCount: number;
  verified: boolean;
  distance_km: number;
}

@Injectable()
export class NearbyProvidersService {
  constructor(private prisma: PrismaService) {}

  async list(query: ListNearbyProvidersDto) {
    const radiusKm = query.radiusKm ?? DEFAULT_RADIUS_KM;

    // earth_box() narrows to a bounding cube first — this is what actually hits
    // the GiST index (provider_profiles_geo_idx) instead of scanning every row.
    // earth_distance() then computes the precise circle from that narrowed set.
    // Replaces the old "pull every provider, compute haversine in Node" approach.
    const rows = await this.prisma.$queryRaw<RawNearbyRow[]>`
      SELECT pp.id, pp."userId", pp.bio, pp.skills, pp.city, pp.country,
             pp."ratingAvg", pp."ratingCount", pp.verified,
             earth_distance(ll_to_earth(${query.lat}, ${query.lng}), ll_to_earth(pp.latitude, pp.longitude)) / 1000 AS distance_km
      FROM provider_profiles pp
      WHERE pp.latitude IS NOT NULL AND pp.longitude IS NOT NULL
        AND earth_box(ll_to_earth(${query.lat}, ${query.lng}), ${radiusKm * 1000}) @> ll_to_earth(pp.latitude, pp.longitude)
      ORDER BY distance_km ASC
      LIMIT 200
    `;

    if (rows.length === 0) return [];

    const providerIds = rows.map((r) => r.id);
    const withCategories = await this.prisma.providerProfile.findMany({
      where: {
        id: { in: providerIds },
        categories: query.categorySlug ? { some: { slug: query.categorySlug } } : undefined,
      },
      include: { categories: true },
    });
    const categoryMap = new Map(withCategories.map((p) => [p.id, p]));
    const skillQuery = query.skill?.toLowerCase().trim();

    const scored = rows
      .filter((r) => categoryMap.has(r.id))
      .map((r) => {
        const full = categoryMap.get(r.id)!;
        const categoryMatch = query.categorySlug ? full.categories.some((c) => c.slug === query.categorySlug) : false;
        const skillMatch = skillQuery ? r.skills.some((s) => s.toLowerCase().includes(skillQuery)) : false;
        if (skillQuery && !skillMatch && !r.bio?.toLowerCase().includes(skillQuery)) return null;

        const proximityScore = Math.max(0, 20 - r.distance_km * 4);
        const score = (categoryMatch ? 50 : 0) + (skillMatch ? 30 : 0) + proximityScore;
        return { row: r, full, score };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    scored.sort((a, b) => b.score - a.score || a.row.distance_km - b.row.distance_km);
    const limited = scored.slice(0, 50);

    return Promise.all(
      limited.map(async ({ row, full, score }) => {
        const user = await this.prisma.user.findUnique({ where: { id: row.userId }, select: { name: true, avatar: true } });
        return {
          providerId: row.id,
          userId: row.userId,
          name: user?.name ?? 'Provider',
          avatar: user?.avatar ?? null,
          bio: row.bio,
          skills: row.skills,
          city: row.city,
          country: row.country,
          ratingAvg: row.ratingAvg,
          ratingCount: row.ratingCount,
          verified: row.verified,
          categories: full.categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
          distanceKm: Number(row.distance_km.toFixed(2)),
          matchScore: Math.round(score),
        };
      }),
    );
  }
}