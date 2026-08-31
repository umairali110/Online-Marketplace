import { notFound } from 'next/navigation';
import Image from 'next/image';
import { storeApi } from '@/lib/store-api';
import { RatingStars } from '@/components/ui/rating-stars';
import { FollowButton } from '@/components/customer/follow-button';
import { StoreTabs } from '@/components/customer/store-tabs';
import { TrackVisit } from '@/components/customer/track-visit';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const store = await storeApi.getBySlug(params.slug);
    return {
      title: `${store.name} — Online Marketplace`,
      description: store.description ?? `Shop ${store.name} on Online Marketplace — ${store.rating.toFixed(1)} rating from ${store.reviewCount} reviews.`,
      openGraph: { title: store.name, images: store.logo ? [{ url: store.logo }] : [] },
    };
  } catch {
    return { title: 'Store — Online Marketplace' };
  }
}

export default async function StorePage({ params }: { params: { slug: string } }) {
  let store;
  try {
    store = await storeApi.getBySlug(params.slug);
  } catch {
    notFound();
  }
  if (!store) notFound();

  return (
    
    <div className="space-y-6">
            <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: store.name,
            image: store.logo,
            address: { '@type': 'PostalAddress', addressLocality: undefined },
            aggregateRating: store.reviewCount > 0 ? {
              '@type': 'AggregateRating',
              ratingValue: store.rating,
              reviewCount: store.reviewCount,
            } : undefined,
          }),
        }}
      />
            <TrackVisit storeId={store.id} />
      {/* Banner */}
      <div className="relative h-40 overflow-hidden rounded-card bg-gradient-to-r from-primary to-primary-dark sm:h-56">
        {store.banner && <Image src={store.banner} alt={`${store.name} banner`} fill className="object-cover" />}
      </div>

      {/* Store header */}
      <div className="-mt-14 flex flex-col items-start gap-4 px-4 sm:flex-row sm:items-end sm:px-0">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-surface bg-surface shadow-md">
          {store.logo ? (
            <Image src={store.logo} alt={store.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-lg font-bold text-primary">
              {store.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-text-primary">{store.name}</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-text-muted">
            <RatingStars rating={store.rating} count={store.reviewCount} />
            <span>{store.followerCount} followers</span>
          </div>
        </div>
        <FollowButton storeId={store.id} />
      </div>

      <StoreTabs store={store} />
    </div>
  );
}