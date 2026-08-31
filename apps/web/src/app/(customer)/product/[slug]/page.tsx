import type { Metadata } from 'next';
import { catalogApi } from '@/lib/catalog-api';
import { ImageGallery } from '@/components/customer/image-gallley';
import { CompareTable } from '@/components/customer/compare-table';
import { ReviewForm } from '@/components/customer/reviews-form';
import { ProductCard } from '@/components/customer/product-card';
import { RatingStars } from '@/components/ui/rating-stars';
import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const product = await catalogApi.getProduct(params.slug);
    const cheapest = product.listings[0];
    return {
      title: `${product.title} — Online Marketplace`,
      description: `${product.title}${product.brand ? ` by ${product.brand}` : ''} — compare prices from ${product.listings.length} stores. Starting at $${cheapest?.price.toFixed(0) ?? '—'}.`,
      openGraph: {
        title: product.title,
        description: `Compare prices from ${product.listings.length} stores`,
        images: product.images[0] ? [{ url: product.images[0] }] : [],
      },
    };
  } catch {
    return { title: 'Product — Online Marketplace' };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const [product, related] = await Promise.all([
    catalogApi.getProduct(params.slug),
    catalogApi.getRelated(params.slug),
  ]);

  const cheapest = product.listings[0];
  const avgRating = product.listings.length
    ? product.listings.reduce((sum, l) => sum + l.rating, 0) / product.listings.length
    : 0;
  const totalReviews = product.listings.reduce((sum, l) => sum + l.reviewCount, 0);

  const wishlistedIds: string[] = [];

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.title,
            brand: product.brand,
            image: product.images,
            offers: product.listings.map((l) => ({
              '@type': 'Offer',
              price: l.price,
              priceCurrency: 'USD',
              availability: l.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              seller: { '@type': 'Organization', name: l.storeName },
            })),
          }),
        }}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ImageGallery images={product.images} alt={product.title} />

        <div>
          <p className="text-sm text-text-muted">{product.brand}</p>
          <h1 className="mt-1 text-2xl font-bold text-text-primary">{product.title}</h1>

          <div className="mt-2 flex items-center gap-2">
            <RatingStars rating={avgRating} count={totalReviews} />
          </div>

          {cheapest && (
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-text-primary">${cheapest.price.toFixed(0)}</span>
              {cheapest.compareAtPrice && (
                <>
                  <span className="text-lg text-text-muted line-through">
                    ${cheapest.compareAtPrice.toFixed(0)}
                  </span>
                  <span className="font-medium text-success">
                    Save ${(cheapest.compareAtPrice - cheapest.price).toFixed(0)}
                  </span>
                </>
              )}
            </div>
          )}

          <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs text-text-muted">
            <div className="flex flex-col items-center gap-1 rounded-btn border border-border py-3">
              <Truck size={18} className="text-primary" />
              Free Delivery
            </div>
            <div className="flex flex-col items-center gap-1 rounded-btn border border-border py-3">
              <RotateCcw size={18} className="text-primary" />
              7 Days Easy Return
            </div>
            <div className="flex flex-col items-center gap-1 rounded-btn border border-border py-3">
              <ShieldCheck size={18} className="text-primary" />
              1 Year Warranty
            </div>
          </div>
        </div>
      </div>

      <CompareTable
        productTitle={product.title}
        productImage={product.images[0] ?? null}
        listings={product.listings}
        wishlistedIds={wishlistedIds}
      />

      {/* Reviews — one review form per store listing, since rating is tracked per-store */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-text-primary">Reviews</h2>
        {product.listings.map((listing) => (
          <div key={listing.id} className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr] sm:items-start">
            <span className="text-sm font-medium text-text-muted">{listing.storeName}</span>
            <ReviewForm storeListingId={listing.id} />
          </div>
        ))}
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-bold text-text-primary">You Might Also Like</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}