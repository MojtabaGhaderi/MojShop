import type { Metadata } from 'next';
import Link from 'next/link';
import ProductGrid from '@/components/product-grid';
import { serverFetch } from '@/lib/api';
import type { ProductListItem, Category, Banner, PromoCode } from '@/types';
import { SITE_NAME } from '@/lib/constants';
import HeroCarousel from "@/components/hero-carousel";
import CategoryRail from "@/components/category-rail";

export const metadata: Metadata = {
  title: `${SITE_NAME} — فروشگاه آنلاین جواهرات و اکسسوری`,
  description: 'مجموعه‌ای از زیورآلات طلا، نقره و بدلیجات با ضمانت اصالت. قیمت روز و ارسال سریع به سراسر ایران.',
};

export default async function HomePage() {
  const results = await Promise.allSettled([
    serverFetch<{ items: ProductListItem[] }>('/products/?limit=8'),
    serverFetch<{ items: ProductListItem[] }>('/products/?metal=silver&limit=8'),
    serverFetch<Category[]>('/categories/'),
    serverFetch<Banner[]>('/banners/?placement=hero'),
    serverFetch<Banner[]>('/banners/?placement=feature'),
    serverFetch<PromoCode[]>('/promos/active'),
  ]);

  function fulfilled<T>(r: PromiseSettledResult<T>, fallback: T): T {
    return r.status === 'fulfilled' ? r.value : fallback;
  }

  const featuredProducts = fulfilled(results[0], { items: [] as ProductListItem[] }).items ?? [];
  const silverProducts = fulfilled(results[1], { items: [] as ProductListItem[] }).items ?? [];
  const categories = fulfilled(results[2], [] as Category[]);
  const heroBanners = fulfilled(results[3], [] as Banner[]);
  const featureBanners = fulfilled(results[4], [] as Banner[]);
  const activePromos = fulfilled(results[5], [] as PromoCode[]);

  const featureBanner = featureBanners[0];

  return (
    <div>
      <HeroCarousel banners={heroBanners} />

      <section className="bg-[#F0EFEA] py-10 sm:py-14">
        <CategoryRail categories={categories} />
      </section>

      {/* Newest products */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium text-primary sm:text-xl">جدیدترین محصولات</h2>
          <Link href="/products" className="text-sm text-accent transition-colors hover:text-accent-hover">مشاهده همه ←</Link>
        </div>
        <ProductGrid products={featuredProducts} isLoading={false} isServerFetched />
      </section>

      {/* Silver collection */}
      {silverProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-medium text-primary sm:text-xl">مجموعه نقره</h2>
            <Link href="/products?metal=silver" className="text-sm text-accent transition-colors hover:text-accent-hover">مشاهده همه ←</Link>
          </div>
          <ProductGrid products={silverProducts} isLoading={false} isServerFetched />
        </section>
      )}

      {/* Active promo codes */}
      {activePromos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="rounded-md border border-accent/30 bg-accent-subtle px-6 py-8 text-center">
            <h2 className="text-lg font-medium text-primary">تخفیف ویژه</h2>
            {activePromos.map((promo) => (
              <p key={promo.id} className="mt-2 text-sm text-primary-muted">
                با کد <span className="font-mono font-semibold text-accent">{promo.code}</span>{' '}
                {promo.type === 'percent' ? `${promo.amount}٪ تخفیف بگیرید` : `${promo.amount.toLocaleString('fa-IR')} تومان تخفیف بگیرید`}
              </p>
            ))}
            <Link href="/products" className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover">شروع خرید</Link>
          </div>
        </section>
      )}

      {/* Feature banner above footer */}
      {featureBanner && (
        <section className="relative h-64 w-full overflow-hidden sm:h-80">
          <img src={featureBanner.image_url} alt={featureBanner.title ?? ''} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-primary/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            {featureBanner.title && <h2 className="text-xl font-medium text-surface sm:text-2xl">{featureBanner.title}</h2>}
            {featureBanner.subtitle && <p className="mt-2 max-w-md text-sm text-surface/80">{featureBanner.subtitle}</p>}
            {featureBanner.link_url && (
              <Link href={featureBanner.link_url} className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover">مشاهده</Link>
            )}
          </div>
        </section>
      )}

      {/* Trust badges */}
      <section className="border-y border-border-default bg-surface-elevated">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-10 sm:grid-cols-4 sm:px-6">
          {[
            { title: 'ضمانت اصالت', desc: 'عیار و اصالت هر قطعه تضمین شده است' },
            { title: 'قیمت لحظه‌ای', desc: 'قیمت‌گذاری بر اساس نرخ روز فلزات' },
            { title: 'ارسال سریع', desc: 'ارسال به سراسر ایران' },
            { title: 'پرداخت امن', desc: 'پرداخت آنلاین از طریق درگاه معتبر' },
          ].map((badge) => (
            <div key={badge.title}>
              <div className="h-px w-5 bg-accent" />
              <h3 className="mt-3 text-sm font-medium text-primary">{badge.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-primary-muted">{badge.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}