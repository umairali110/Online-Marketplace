import { MetadataRoute } from 'next';
import { catalogApi } from '@/lib/catalog-api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/services`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/stores/local`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/refund-policy`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  try {
    const categories = await catalogApi.getCategories();
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      changeFrequency: 'daily',
      priority: 0.6,
    }));

    // First page of products per category — caps sitemap size, still covers the
    // highest-traffic pages. Full catalog crawl coverage is a v2 (chunked
    // sitemaps via generateSitemaps()) once catalog size actually needs it.
    const productLists = await Promise.all(
      categories.slice(0, 10).map((c) => catalogApi.getProducts({ categorySlug: c.slug, page: 1 })),
    );
    const productRoutes: MetadataRoute.Sitemap = productLists
      .flatMap((res) => res.data)
      .map((p) => ({ url: `${SITE_URL}/product/${p.canonicalSlug}`, changeFrequency: 'weekly' as const, priority: 0.5 }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}