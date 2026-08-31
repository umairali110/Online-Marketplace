import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  ArrowRight,
  MapPin,
  Sparkles,
  Search,
  Store,
  Wrench,
  Star,
} from 'lucide-react';

import { RatingStars } from '@/components/ui/rating-stars';
import { GigTeaserCard } from '@/components/customer/gig-teaser-card';
import { Footer } from '@/components/shared/footer';
import { catalogApi } from '@/lib/catalog-api';
import { platformApi } from '@/lib/platform-api';
import { api } from '@/lib/api-client';
import { HomeTopBar } from '@/components/customer/home-top-bar';

const trustStrip = [
  {
    icon: ShieldCheck,
    title: 'Best Deal',
    subtitle: 'Guaranteed',
  },
  {
    icon: Truck,
    title: 'Free',
    subtitle: 'Shipping',
  },
  {
    icon: RotateCcw,
    title: 'Easy',
    subtitle: 'Returns',
  },
  {
    icon: Headphones,
    title: '24/7',
    subtitle: 'Support',
  },
];

const featuredServiceCategories = [
  { slug: 'plumbing', name: 'Plumbing', icon: '🔧' },
  { slug: 'electrical-work', name: 'Electrical', icon: '💡' },
  { slug: 'tutoring', name: 'Tutoring', icon: '📚' },
  { slug: 'home-cleaning', name: 'Cleaning', icon: '🧹' },
  { slug: 'graphic-design', name: 'Design', icon: '🎨' },
  { slug: 'home-repair', name: 'Repair', icon: '🛠️' },
];

async function safeFetch<T>(
  promise: Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  /*
   * -------------------------------------------------------
   * KEEPING YOUR EXISTING DATA FLOW EXACTLY THE SAME
   * -------------------------------------------------------
   */
  const [categories, bestDeals, topStores, stats, gigs] =
    await Promise.all([
      safeFetch(catalogApi.getCategories(), []),

      safeFetch(catalogApi.getBestDeals(), []),

      safeFetch(catalogApi.getTopStores(), []),

      safeFetch(platformApi.getStats(), {
        totalCustomers: 0,
        totalStores: 0,
        totalProviders: 0,
        totalOrders: 0,
      }),

      safeFetch(
        api
          .get('/gigs/by-category/plumbing')
          .then((r) => r.data as any[]),
        []
      ),
    ]);

  const statCards = [
    {
      label: 'Happy Customers',
      value: stats.totalCustomers,
    },
    {
      label: 'Active Stores',
      value: stats.totalStores,
    },
    {
      label: 'Verified Providers',
      value: stats.totalProviders,
    },
    {
      label: 'Orders Delivered',
      value: stats.totalOrders,
    },
  ];

  return (
    <div className="-mx-4 -mt-6 overflow-hidden bg-white sm:mx-0 sm:mt-0">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <HomeTopBar />

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-white to-blue-50/40">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-blue-50 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-14 pt-8 sm:px-8 sm:pb-20 lg:grid-cols-2 lg:gap-4 lg:px-10 lg:pt-12">
          {/* LEFT SIDE */}
          <div className="relative z-10 max-w-2xl">
            {/* Trust badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-2 shadow-sm">
              <div className="flex -space-x-2">
                <div className="h-6 w-6 rounded-full border-2 border-white bg-blue-200" />
                <div className="h-6 w-6 rounded-full border-2 border-white bg-green-200" />
                <div className="h-6 w-6 rounded-full border-2 border-white bg-purple-200" />
              </div>

              <span className="text-xs font-semibold text-slate-700 sm:text-sm">
                Trusted by 20K+ customers
              </span>

              <Sparkles
                size={14}
                className="text-blue-600"
              />
            </div>

            {/* Heading */}
            <h1 className="max-w-2xl text-4xl font-black leading-[1.03] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl xl:text-7xl">
              Find the best.
              <br />

              <span className="text-blue-600">
                From every store.
              </span>

              <br />

              Hire the best, nearby.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7 lg:text-lg">
              Compare prices across real sellers, shop with buyer
              protection, and hire verified local service providers —
              all in one marketplace.
            </p>

            {/* CTA */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/category/electronics"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Shop Now
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/services"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 text-sm font-bold text-slate-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600"
              >
                Find Services
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          {/* RIGHT HERO IMAGE */}
          <div className="relative mx-auto h-[390px] w-full max-w-xl sm:h-[480px] lg:h-[560px]">
            {/* Blue circle/background */}
            <div className="absolute right-0 top-8 h-[290px] w-[290px] rounded-full bg-blue-100 sm:h-[400px] sm:w-[400px] lg:right-4 lg:top-8 lg:h-[500px] lg:w-[500px]" />

            <div className="absolute right-0 top-16 h-72 w-72 rounded-full border border-blue-200 sm:right-8 sm:h-96 sm:w-96 lg:right-12 lg:h-[460px] lg:w-[460px]" />

            {/* Dotted pattern */}
            <div className="absolute left-8 top-10 grid grid-cols-5 gap-2 opacity-40">
              {Array.from({ length: 25 }).map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-blue-300"
                />
              ))}
            </div>

            {/* Girl */}
            <div className="absolute inset-0 z-10 flex items-end justify-center">
  <div className="relative h-full w-[80%]">
    <Image
      src="/images/marketplace-hero.png"
      alt="Trusted local service provider"
      fill
      priority
      className="object-contain object-bottom drop-shadow-xl"
      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 600px"
    />
  </div>
</div>

            {/* Customer stat */}
            <div className="absolute right-0 top-16 z-20 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl sm:right-2 sm:top-20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Store size={20} />
                </div>

                <div>
                  <p className="text-[10px] font-medium text-slate-500">
                    Happy Customers
                  </p>
                  <p className="text-base font-extrabold text-slate-900">
                    {stats.totalCustomers.toLocaleString()}+
                  </p>
                </div>
              </div>
            </div>

            {/* Stores stat */}
            <div className="absolute right-0 top-36 z-20 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl sm:right-0 sm:top-48">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Store size={20} />
                </div>

                <div>
                  <p className="text-[10px] font-medium text-slate-500">
                    Active Stores
                  </p>
                  <p className="text-base font-extrabold text-slate-900">
                    {stats.totalStores.toLocaleString()}+
                  </p>
                </div>
              </div>
            </div>

            {/* Providers stat */}
            <div className="absolute bottom-14 left-0 z-20 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl sm:left-0 sm:bottom-20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <p className="text-[10px] font-medium text-slate-500">
                    Verified Providers
                  </p>
                  <p className="text-base font-extrabold text-slate-900">
                    {stats.totalProviders.toLocaleString()}+
                  </p>
                </div>
              </div>
            </div>

            {/* Orders stat */}
            <div className="absolute bottom-2 right-2 z-20 rounded-2xl bg-blue-600 px-4 py-3 text-white shadow-xl sm:right-10 sm:bottom-12">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  <Truck size={20} />
                </div>

                <div>
                  <p className="text-[10px] text-blue-100">
                    Orders Delivered
                  </p>
                  <p className="text-base font-extrabold">
                    {stats.totalOrders.toLocaleString()}+
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            TRUST STRIP
        ====================================================== */}
        <div className="relative mx-auto max-w-6xl px-4 pb-8 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg shadow-slate-200/50 sm:grid-cols-4">
            {trustStrip.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className={`flex items-center justify-center gap-3 px-3 py-5 ${
                    index !== trustStrip.length - 1
                      ? 'border-b border-slate-100 sm:border-b-0 sm:border-r'
                      : ''
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Icon size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {item.title}
                    </p>

                    <p className="text-[11px] text-slate-500">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <main className="mx-auto max-w-7xl space-y-16 px-4 py-10 sm:px-8 lg:px-10">

        {/* ===================================================
            CATEGORIES
        ==================================================== */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600">
                Explore
              </p>

              <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                Shop by Category
              </h2>
            </div>

            <Link
              href="/category/electronics"
              className="hidden items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 sm:flex"
            >
              View all
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group flex min-h-[110px] flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl transition-transform group-hover:scale-110">
                  {category.icon}
                </div>

                <span className="line-clamp-1 text-xs font-bold text-slate-800">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ===================================================
            BEST DEALS
        ==================================================== */}
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600">
                Deals
              </p>

              <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                Best Deals For You
              </h2>
            </div>

            <Link
              href="/category/electronics"
              className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              View all deals
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {bestDeals.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.canonicalSlug}`}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-white p-2.5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 sm:p-3"
              >
                <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-slate-50">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      No image
                    </div>
                  )}

                  <span className="absolute left-2 top-2 rounded-full bg-green-500 px-2 py-1 text-[9px] font-extrabold text-white shadow-sm">
                    Best Deal
                  </span>
                </div>

                <h3 className="line-clamp-1 text-sm font-bold text-slate-900">
                  {product.title}
                </h3>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-base font-extrabold text-slate-950">
                    ${product.price.toFixed(0)}
                  </span>

                  {product.compareAtPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      ${product.compareAtPrice.toFixed(0)}
                    </span>
                  )}
                </div>

                <div className="mt-1.5 flex items-center gap-1">
                  <RatingStars rating={product.rating} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ===================================================
            LOCAL SERVICES
        ==================================================== */}
        <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-green-50 p-5 sm:p-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                Verified Professionals
              </span>

              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                Need Something Fixed?
                <br className="hidden sm:block" />
                Find Local Help
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Trusted plumbers, electricians, tutors and more near you.
              </p>
            </div>

            <Link
              href="/providers/nearby"
              className="inline-flex items-center gap-1 text-sm font-bold text-blue-600"
            >
              <MapPin size={15} />
              Find providers near me
            </Link>
          </div>

          <div className="mb-7 flex gap-3 overflow-x-auto pb-2">
            {featuredServiceCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/services?category=${category.slug}`}
                className="group flex min-w-[105px] shrink-0 flex-col items-center rounded-2xl border border-white bg-white px-4 py-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <span className="mb-2 text-2xl transition-transform group-hover:scale-110">
                  {category.icon}
                </span>

                <span className="text-xs font-bold text-slate-800">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>

          {gigs.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {gigs.slice(0, 4).map((gig: any) => (
                <GigTeaserCard
                  key={gig.id}
                  providerId={gig.provider.id}
                  providerName={gig.provider.name}
                  providerAvatar={gig.provider.avatar}
                  verified={gig.provider.verified}
                  ratingAvg={gig.provider.ratingAvg}
                  title={gig.title}
                  price={gig.price}
                  image={gig.images?.[0] ?? null}
                />
              ))}
            </div>
          )}
        </section>

        {/* ===================================================
            TOP STORES
        ==================================================== */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600">
                Marketplace
              </p>

              <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                Top Stores
              </h2>
            </div>

            <Link
              href="/stores/local"
              className="flex items-center gap-1 text-sm font-bold text-blue-600"
            >
              View all stores
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
            {topStores.map((store) => (
              <Link
                key={store.id}
                href={`/store/${store.slug}`}
                className="group flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white px-3 py-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="relative mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-sm font-extrabold text-blue-600">
                  {store.logo ? (
                    <Image
                      src={store.logo}
                      alt={store.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    store.name.slice(0, 2).toUpperCase()
                  )}
                </div>

                <span className="line-clamp-1 text-xs font-bold text-slate-800">
                  {store.name}
                </span>

                <div className="mt-2">
                  <RatingStars rating={store.rating} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ===================================================
            PLATFORM STATS
        ==================================================== */}
        <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="border-white/10 sm:border-r sm:last:border-r-0"
              >
                <p className="text-2xl font-black sm:text-3xl">
                  {stat.value.toLocaleString()}+
                </p>

                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================
            SELL / PROVIDER CTA
        ==================================================== */}
        <section className="grid gap-5 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-blue-50 p-7 sm:p-9">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-200/50 blur-2xl" />

            <div className="relative z-10 max-w-md">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Store size={21} />
              </div>

              <h3 className="text-2xl font-extrabold text-slate-950">
                Have products to sell?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Open your store in minutes and reach local buyers with
                powerful marketplace tools.
              </p>

              <Link
                href="/register"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Start Selling
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-green-100 bg-green-50 p-7 sm:p-9">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-green-200/50 blur-2xl" />

            <div className="relative z-10 max-w-md">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-600 text-white">
                <Wrench size={21} />
              </div>

              <h3 className="text-2xl font-extrabold text-slate-950">
                Offer a skill or service?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                List your services, get hired directly and grow your
                reputation with customer reviews.
              </p>

              <Link
                href="/register"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700"
              >
                Become a Provider
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <Footer />
    </div>
  );
}