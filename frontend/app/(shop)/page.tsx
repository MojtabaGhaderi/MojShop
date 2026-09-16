import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { serverFetch } from '@/lib/api';
import type { Category, Banner, PromoCode, HomeSectionFeedItem } from '@/types';
import { SITE_NAME } from '@/lib/constants';

import HeroCarousel from '@/components/hero-carousel';
import CategoryRail from '@/components/category-rail';
import ProductRail from '@/components/product-rail';
import EditorialPromo from '@/components/editorial-promo';
import TrustPillars, { type TrustBadgeItem } from '@/components/trust-pillars';

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

  const featureBanner = featureBanners[0];

  return (
    <div className="flex flex-col gap-0">
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

      {/* 5. Feature Banner - Architectural Full-Bleed Story */}
      {featureBanner && (
        <section className="relative w-full overflow-hidden bg-background">
          <div className="relative aspect-[4/5] min-h-[460px] w-full sm:aspect-[21/9] sm:min-h-[520px]">
            <Image
              src={featureBanner.image_url}
              alt={featureBanner.title ?? 'مجموعه ویژه'}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />

            {/* Editorial Atmosphere Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10 sm:bg-gradient-to-r sm:from-black/70 sm:via-black/35 sm:to-transparent" />

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-end sm:items-center">
              <div className="mx-auto w-full max-w-[1440px] px-6 pb-12 sm:px-8 sm:pb-0 lg:px-12">
                <div className="max-w-xl text-right">
                  <span className="font-mono text-xs uppercase tracking-widest text-white/70">
                    روایت نقره
                  </span>

                  {featureBanner.title && (
                    <h2 className="mt-3 text-2xl font-light leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                      {featureBanner.title}
                    </h2>
                  )}

                  {featureBanner.subtitle && (
                    <p className="mt-4 text-sm font-normal leading-relaxed text-white/80 sm:text-base">
                      {featureBanner.subtitle}
                    </p>
                  )}

                  {featureBanner.link_url && (
                    <div className="mt-7 sm:mt-9">
                      <Link
                        href={featureBanner.link_url}
                        className="group inline-flex h-12 items-center justify-center gap-3 border border-white/60 bg-white/10 px-8 text-xs font-medium uppercase tracking-widest text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
                      >
                        <span>مشاهده اثر</span>
                        <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
                          ←
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. Trust Badges (Admin Controlled) */}
      <TrustPillars badges={trustBadges} />
    </div>
  );
}