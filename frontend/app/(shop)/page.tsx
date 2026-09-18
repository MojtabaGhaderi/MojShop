// frontend/app/(shop)/page.tsx
import type { Metadata } from 'next';
import { serverFetch } from '@/lib/api';
import type { Category, Banner, PromoCode, HomeSectionFeedItem } from '@/types';
import { SITE_NAME } from '@/lib/constants';

import HeroCarousel from '@/components/hero-carousel';
import CategoryRail from '@/components/category-rail';
import ProductRail from '@/components/product-rail';
import EditorialPromo from '@/components/editorial-promo';
import TrustPillars, { type TrustBadgeItem } from '@/components/trust-pillars';
import { FeatureCarousel } from '@/components/feature-banner';

export const metadata: Metadata = {
  title: `${SITE_NAME} — گالری زیورآلات نقره`,
  description: 'مجموعه‌ای از زیورآلات نقره دست‌ساز با تضمین اصالت و ارسال به سراسر ایران.',
};

export default async function HomePage() {
  const results = await Promise.allSettled([
    serverFetch<HomeSectionFeedItem[]>('/home-sections/feed'),
    serverFetch<Category[]>('/categories/'),
    serverFetch<Banner[]>('/banners/?placement=hero'),
    serverFetch<Banner[]>('/banners/?placement=feature'),
    serverFetch<PromoCode[]>('/promos/featured'),
    serverFetch<TrustBadgeItem[]>('/trust-badges/'),
  ]);

  function fulfilled<T>(r: PromiseSettledResult<T>, fallback: T): T {
    return r.status === 'fulfilled' ? r.value : fallback;
  }

  const homeRails = fulfilled(results[0], [] as HomeSectionFeedItem[]);
  const categories = fulfilled(results[1], [] as Category[]);
  const heroBanners = fulfilled(results[2], [] as Banner[]);
  const featureBanners = fulfilled(results[3], [] as Banner[]);
  const featuredPromos = fulfilled(results[4], [] as PromoCode[]);
  const trustBadges = fulfilled(results[5], [] as TrustBadgeItem[]);

  return (
    <div className="flex flex-col gap-0" dir="rtl">
      {/* 1. Hero Carousel */}
      <HeroCarousel banners={heroBanners} />

      {/* 2. Category Navigation Rail */}
      <section className="bg-secondary/40 py-10 sm:py-14">
        <CategoryRail categories={categories} />
      </section>

      {/* 3. Dynamic Curated Rails (Admin Controlled) */}
      {homeRails.map((rail, index) => (
        <div
          key={rail.id}
          className={index % 2 === 1 ? 'border-t border-border/40 bg-background' : ''}
        >
          <ProductRail
            title={rail.title}
            subtitle={rail.subtitle}
            products={rail.products}
            viewAllHref={rail.view_all_href}
          />
        </div>
      ))}

      {/* 4. Editorial Promo Section (Renders only if is_featured promo exists) */}
      <EditorialPromo promos={featuredPromos} />

      {/* 5. Feature Banner - Crossfading Auto-Slide Carousel */}
      {featureBanners.length > 0 && (
        <FeatureCarousel banners={featureBanners} />
      )}

      {/* 6. Trust Badges (Admin Controlled) */}
      <TrustPillars badges={trustBadges} />
    </div>
  );
}