import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function productImage(seed: string, w = 600, h = 600) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}
function storeLogo(seed: string) {
  return `https://picsum.photos/seed/${seed}-logo/200/200`;
}
function storeBanner(seed: string) {
  return `https://picsum.photos/seed/${seed}-banner/1200/300`;
}
function gigImage(seed: string) {
  return `https://picsum.photos/seed/${seed}-gig/800/400`;
}

async function main() {
  // --- Product Categories ---
  const categoryData = [
    { name: 'Electronics', slug: 'electronics', icon: '📱' },
    { name: 'Fashion', slug: 'fashion', icon: '👗' },
    { name: 'Home & Living', slug: 'home-living', icon: '🛋️' },
    { name: 'Beauty', slug: 'beauty', icon: '💄' },
    { name: 'Sports', slug: 'sports', icon: '🏀' },
    { name: 'Toys & Games', slug: 'toys-games', icon: '🧸' },
  ];
  const categories = await Promise.all(
    categoryData.map((c) => prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c })),
  );
  const electronics = categories.find((c) => c.slug === 'electronics')!;
  const fashion = categories.find((c) => c.slug === 'fashion')!;
  const beauty = categories.find((c) => c.slug === 'beauty')!;
  const homeLiving = categories.find((c) => c.slug === 'home-living')!;
  const sports = categories.find((c) => c.slug === 'sports')!;
  const toysGames = categories.find((c) => c.slug === 'toys-games')!;

  // --- Original 5 stores (Day 2) ---
  const originalStoreDefs = [
    { name: 'TechWorld', city: 'Rawalpindi', country: 'Pakistan' },
    { name: 'MobileHub', city: 'Islamabad', country: 'Pakistan' },
    { name: 'PhoneStore', city: 'Lahore', country: 'Pakistan' },
    { name: 'FashionHub', city: 'Karachi', country: 'Pakistan' },
    { name: 'BeautyGlow', city: 'Islamabad', country: 'Pakistan' },
  ];
  const stores: Record<string, any> = {};
  for (const def of originalStoreDefs) {
    const email = `${def.name.toLowerCase()}@seed.local`;
    const seller = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: def.name,
        role: 'SELLER',
        emailVerified: true,
        city: def.city,
        country: def.country,
        passwordHash: await bcrypt.hash('password123', 10),
      },
    });
    const slug = def.name.toLowerCase().replace(/\s+/g, '-');
    stores[def.name] = await prisma.store.upsert({
      where: { slug },
      update: { logo: storeLogo(slug), banner: storeBanner(slug), city: def.city, country: def.country },
      create: {
        sellerId: seller.id,
        name: def.name,
        slug,
        status: 'ACTIVE',
        city: def.city,
        country: def.country,
        rating: 4 + Math.random(),
        logo: storeLogo(slug),
        banner: storeBanner(slug),
      },
    });
  }
  const { TechWorld: techWorld, MobileHub: mobileHub, PhoneStore: phoneStore, FashionHub: fashionHub, BeautyGlow: beautyGlow } = stores;

  // --- Original 7 products (Day 2) ---
  const originalProducts: { slug: string; title: string; brand: string; categoryId: string; listings: { store: any; price: number; compareAt?: number; bestDeal?: boolean; rating: number; reviewCount: number; stock: number }[] }[] = [
    {
      slug: 'apple-iphone-15-pro-256gb', title: 'Apple iPhone 15 Pro (256GB)', brand: 'Apple', categoryId: electronics.id,
      listings: [
        { store: techWorld, price: 999, compareAt: 1099, bestDeal: true, rating: 4.6, reviewCount: 483, stock: 20 },
        { store: mobileHub, price: 1019, rating: 4.4, reviewCount: 210, stock: 12 },
        { store: phoneStore, price: 1029, rating: 4.3, reviewCount: 96, stock: 8 },
      ],
    },
    {
      slug: 'macbook-air-m2', title: 'MacBook Air M2', brand: 'Apple', categoryId: electronics.id,
      listings: [
        { store: techWorld, price: 1199, bestDeal: true, rating: 4.7, reviewCount: 312, stock: 15 },
        { store: mobileHub, price: 1249, rating: 4.5, reviewCount: 87, stock: 5 },
      ],
    },
    {
      slug: 'sony-wh-1000xm5', title: 'Sony WH-1000XM5', brand: 'Sony', categoryId: electronics.id,
      listings: [
        { store: techWorld, price: 299, bestDeal: true, rating: 4.8, reviewCount: 601, stock: 30 },
        { store: phoneStore, price: 319, rating: 4.6, reviewCount: 140, stock: 10 },
      ],
    },
    {
      slug: 'apple-watch-series-9', title: 'Apple Watch Series 9', brand: 'Apple', categoryId: electronics.id,
      listings: [
        { store: techWorld, price: 399, bestDeal: true, rating: 4.5, reviewCount: 220, stock: 25 },
        { store: mobileHub, price: 419, rating: 4.4, reviewCount: 95, stock: 18 },
      ],
    },
    {
      slug: 'nike-air-max-270', title: 'Nike Air Max 270', brand: 'Nike', categoryId: fashion.id,
      listings: [{ store: fashionHub, price: 129, bestDeal: true, rating: 4.3, reviewCount: 178, stock: 40 }],
    },
    {
      slug: 'instant-pot-duo', title: 'Instant Pot Duo', brand: 'Instant Pot', categoryId: homeLiving.id,
      listings: [{ store: fashionHub, price: 89, bestDeal: true, rating: 4.5, reviewCount: 340, stock: 22 }],
    },
    {
      slug: 'vitamin-c-serum', title: 'Vitamin C Brightening Serum', brand: 'GlowLab', categoryId: beauty.id,
      listings: [{ store: beautyGlow, price: 24, bestDeal: true, rating: 4.6, reviewCount: 512, stock: 60 }],
    },
  ];

  // --- Expanded stores (home-page-redesign batch) ---
  const moreStoreDefs = [
    { name: 'HomeStyle', city: 'Lahore', country: 'Pakistan' },
    { name: 'SportsZone', city: 'Karachi', country: 'Pakistan' },
    { name: 'ToyLand', city: 'Islamabad', country: 'Pakistan' },
    { name: 'GadgetHub', city: 'Rawalpindi', country: 'Pakistan' },
    { name: 'StyleCorner', city: 'Lahore', country: 'Pakistan' },
  ];
  for (const def of moreStoreDefs) {
    const email = `${def.name.toLowerCase()}@seed.local`;
    const seller = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email, name: def.name, role: 'SELLER', emailVerified: true,
        city: def.city, country: def.country,
        passwordHash: await bcrypt.hash('password123', 10),
      },
    });
    const slug = def.name.toLowerCase().replace(/\s+/g, '-');
    stores[def.name] = await prisma.store.upsert({
      where: { slug },
      update: { logo: storeLogo(slug), banner: storeBanner(slug), city: def.city, country: def.country },
      create: {
        sellerId: seller.id, name: def.name, slug, status: 'ACTIVE',
        city: def.city, country: def.country, rating: 4 + Math.random(),
        logo: storeLogo(slug), banner: storeBanner(slug),
      },
    });
  }

  // --- Expanded products ---
  const moreProducts: { title: string; slug: string; categoryId: string; brand: string; store: any; price: number; compareAt?: number; bestDeal?: boolean }[] = [
    { title: 'Samsung Galaxy S24', slug: 'samsung-galaxy-s24', categoryId: electronics.id, brand: 'Samsung', store: stores['GadgetHub'], price: 849, compareAt: 949, bestDeal: true },
    { title: 'Dell XPS 13', slug: 'dell-xps-13', categoryId: electronics.id, brand: 'Dell', store: stores['GadgetHub'], price: 1099, bestDeal: true },
    { title: 'Bose QuietComfort Earbuds', slug: 'bose-quietcomfort-earbuds', categoryId: electronics.id, brand: 'Bose', store: stores['GadgetHub'], price: 199 },
    { title: 'Samsung 55" 4K Smart TV', slug: 'samsung-55-4k-tv', categoryId: electronics.id, brand: 'Samsung', store: stores['GadgetHub'], price: 549, compareAt: 649, bestDeal: true },
    { title: "Levi's 501 Jeans", slug: 'levis-501-jeans', categoryId: fashion.id, brand: "Levi's", store: stores['StyleCorner'], price: 69, bestDeal: true },
    { title: 'Adidas Ultraboost', slug: 'adidas-ultraboost', categoryId: fashion.id, brand: 'Adidas', store: stores['StyleCorner'], price: 159, compareAt: 189 },
    { title: 'Ray-Ban Aviator Sunglasses', slug: 'rayban-aviator', categoryId: fashion.id, brand: 'Ray-Ban', store: stores['StyleCorner'], price: 129 },
    { title: 'Leather Weekender Bag', slug: 'leather-weekender-bag', categoryId: fashion.id, brand: 'StyleCorner', store: stores['StyleCorner'], price: 89, bestDeal: true },
    { title: 'Dyson V15 Vacuum', slug: 'dyson-v15-vacuum', categoryId: homeLiving.id, brand: 'Dyson', store: stores['HomeStyle'], price: 599, compareAt: 699, bestDeal: true },
    { title: 'IKEA-Style Sofa Set', slug: 'sofa-set-3-seater', categoryId: homeLiving.id, brand: 'HomeStyle', store: stores['HomeStyle'], price: 449 },
    { title: 'Nespresso Coffee Machine', slug: 'nespresso-coffee-machine', categoryId: homeLiving.id, brand: 'Nespresso', store: stores['HomeStyle'], price: 179, bestDeal: true },
    { title: 'Egyptian Cotton Bedsheet Set', slug: 'egyptian-cotton-bedsheets', categoryId: homeLiving.id, brand: 'HomeStyle', store: stores['HomeStyle'], price: 59 },
    { title: 'Yoga Mat Pro', slug: 'yoga-mat-pro', categoryId: sports.id, brand: 'SportsZone', store: stores['SportsZone'], price: 39, bestDeal: true },
    { title: 'Adjustable Dumbbell Set', slug: 'adjustable-dumbbell-set', categoryId: sports.id, brand: 'SportsZone', store: stores['SportsZone'], price: 199, compareAt: 249 },
    { title: 'Mountain Bike 21-Speed', slug: 'mountain-bike-21-speed', categoryId: sports.id, brand: 'SportsZone', store: stores['SportsZone'], price: 349, bestDeal: true },
    { title: 'Football - Match Ball', slug: 'football-match-ball', categoryId: sports.id, brand: 'SportsZone', store: stores['SportsZone'], price: 29 },
    { title: 'LEGO Classic Creative Set', slug: 'lego-classic-creative-set', categoryId: toysGames.id, brand: 'LEGO', store: stores['ToyLand'], price: 49, bestDeal: true },
    { title: 'Remote Control Race Car', slug: 'rc-race-car', categoryId: toysGames.id, brand: 'ToyLand', store: stores['ToyLand'], price: 45 },
    { title: 'Wooden Puzzle Board', slug: 'wooden-puzzle-board', categoryId: toysGames.id, brand: 'ToyLand', store: stores['ToyLand'], price: 19 },
    { title: 'Plush Teddy Bear (Large)', slug: 'plush-teddy-bear-large', categoryId: toysGames.id, brand: 'ToyLand', store: stores['ToyLand'], price: 24, bestDeal: true },
  ];

  // --- Create original products + listings ---
  for (const p of originalProducts) {
    const product = await prisma.product.upsert({
      where: { canonicalSlug: p.slug },
      update: { images: [productImage(p.slug)] },
      create: { categoryId: p.categoryId, title: p.title, brand: p.brand, images: [productImage(p.slug)], canonicalSlug: p.slug },
    });
    for (const l of p.listings) {
      const existing = await prisma.storeListing.findFirst({ where: { storeId: l.store.id, productId: product.id } });
      if (!existing) {
        await prisma.storeListing.create({
          data: {
            storeId: l.store.id, productId: product.id, price: l.price, compareAtPrice: l.compareAt,
            stock: l.stock, isBestDeal: !!l.bestDeal, rating: l.rating, reviewCount: l.reviewCount,
          },
        });
      }
    }
  }

  // --- Create expanded products + listings ---
  for (const p of moreProducts) {
    const product = await prisma.product.upsert({
      where: { canonicalSlug: p.slug },
      update: { images: [productImage(p.slug)] },
      create: { categoryId: p.categoryId, title: p.title, brand: p.brand, images: [productImage(p.slug)], canonicalSlug: p.slug },
    });
    const existing = await prisma.storeListing.findFirst({ where: { storeId: p.store.id, productId: product.id } });
    if (!existing) {
      await prisma.storeListing.create({
        data: {
          storeId: p.store.id, productId: product.id, price: p.price, compareAtPrice: p.compareAt,
          stock: 15 + Math.floor(Math.random() * 40), isBestDeal: !!p.bestDeal,
          rating: 4 + Math.random() * 0.9, reviewCount: Math.floor(Math.random() * 400),
        },
      });
    }
  }

  // --- Service Categories ---
  const serviceCategoryData = [
    { name: 'Plumbing', slug: 'plumbing', icon: '🔧' },
    { name: 'Electrical Work', slug: 'electrical-work', icon: '💡' },
    { name: 'Tutoring', slug: 'tutoring', icon: '📚' },
    { name: 'Home Cleaning', slug: 'home-cleaning', icon: '🧹' },
    { name: 'Graphic Design', slug: 'graphic-design', icon: '🎨' },
    { name: 'Home Repair', slug: 'home-repair', icon: '🛠️' },
  ];
  const svcCategories = await Promise.all(
    serviceCategoryData.map((c) => prisma.serviceCategory.upsert({ where: { slug: c.slug }, update: {}, create: c })),
  );
  const findSvcCat = (slug: string) => svcCategories.find((c) => c.slug === slug)!;

  // --- Service Providers + Gigs ---
  const providerDefs = [
    { name: 'Ahmed Raza', email: 'ahmed.plumber@seed.local', avatarImg: 1, bio: 'Licensed plumber with 8 years of experience in residential and commercial pipe work.', skills: ['Pipe Fitting', 'Leak Repair', 'Water Heater Install'], categorySlug: 'plumbing', city: 'Rawalpindi', country: 'Pakistan', lat: 33.6007, lng: 73.0679, verified: true, gigs: [{ title: 'I will fix any leaking pipe or tap', price: 25, days: 1 }, { title: 'I will install your water heater', price: 60, days: 2 }] },
    { name: 'Sara Khan', email: 'sara.electrician@seed.local', avatarImg: 5, bio: 'Certified electrician specializing in home wiring, panel upgrades, and safety inspections.', skills: ['Wiring', 'Circuit Breaker', 'Safety Inspection'], categorySlug: 'electrical-work', city: 'Islamabad', country: 'Pakistan', lat: 33.6844, lng: 73.0479, verified: true, gigs: [{ title: 'I will rewire a room safely and quickly', price: 80, days: 3 }] },
    { name: 'Bilal Ahmed', email: 'bilal.tutor@seed.local', avatarImg: 12, bio: 'Math and Physics tutor for O/A-Levels and university students, 6 years teaching experience.', skills: ['Mathematics', 'Physics', 'Exam Prep'], categorySlug: 'tutoring', city: 'Rawalpindi', country: 'Pakistan', lat: 33.5973, lng: 73.0515, verified: true, gigs: [{ title: 'I will tutor you in A-Level Math', price: 15, days: 1 }, { title: 'I will help you prep for Physics exams', price: 20, days: 1 }] },
    { name: 'Ayesha Malik', email: 'ayesha.cleaner@seed.local', avatarImg: 9, bio: 'Professional home cleaning service — deep cleans, move-in/move-out, and regular upkeep.', skills: ['Deep Cleaning', 'Move-out Cleaning', 'Sanitization'], categorySlug: 'home-cleaning', city: 'Islamabad', country: 'Pakistan', lat: 33.6938, lng: 73.0651, verified: false, gigs: [{ title: 'I will deep clean your entire home', price: 40, days: 1 }] },
    { name: 'Hamza Sheikh', email: 'hamza.designer@seed.local', avatarImg: 15, bio: 'Graphic designer creating logos, branding kits, and social media creatives.', skills: ['Logo Design', 'Branding', 'Social Media Graphics'], categorySlug: 'graphic-design', city: 'Rawalpindi', country: 'Pakistan', lat: 33.6109, lng: 73.0783, verified: true, gigs: [{ title: 'I will design a modern logo for your brand', price: 35, days: 3 }, { title: 'I will create a full social media kit', price: 55, days: 4 }] },
    { name: 'Usman Tariq', email: 'usman.repair@seed.local', avatarImg: 22, bio: 'General home repair handyman — furniture assembly, wall mounting, small fixes.', skills: ['Furniture Assembly', 'Wall Mounting', 'General Repair'], categorySlug: 'home-repair', city: 'Lahore', country: 'Pakistan', lat: 31.5204, lng: 74.3587, verified: false, gigs: [{ title: 'I will assemble any flat-pack furniture', price: 20, days: 1 }] },
  ];

  for (const p of providerDefs) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email, name: p.name, role: 'PROVIDER', emailVerified: true,
        city: p.city, country: p.country, avatar: `https://i.pravatar.cc/300?img=${p.avatarImg}`,
        passwordHash: await bcrypt.hash('password123', 10),
      },
    });

    const category = findSvcCat(p.categorySlug);
    const profile = await prisma.providerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id, bio: p.bio, skills: p.skills, tags: p.skills,
        city: p.city, country: p.country, latitude: p.lat, longitude: p.lng,
        ratingAvg: 4 + Math.random() * 0.9, ratingCount: 10 + Math.floor(Math.random() * 90),
        verified: p.verified, categories: { connect: [{ id: category.id }] },
      },
    });

    for (const gig of p.gigs) {
      const existingGig = await prisma.gig.findFirst({ where: { providerId: profile.id, title: gig.title } });
      if (!existingGig) {
        await prisma.gig.create({
          data: {
            providerId: profile.id, categoryId: category.id, title: gig.title,
            description: `${gig.title}. Reliable, on-time, and quality guaranteed — book with confidence.`,
            price: gig.price, deliveryDays: gig.days,
            images: [gigImage(gig.title.toLowerCase().replace(/\s+/g, '-').slice(0, 30))],
          },
        });
      }
    }
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });