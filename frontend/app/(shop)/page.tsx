import type { Metadata } from 'next';
import Link from 'next/link';
import ProductGrid from '@/components/product-grid';
import { serverFetch } from '@/lib/api';
import type { ProductListItem, Category, Banner, PromoCode } from '@/types';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `${SITE_NAME} — فروشگاه آنلاین جواهرات و اکسسوری`,
  description: 'مجموعه‌ای از زیورآلات طلا، نقره و بدلیجات با ضمانت اصالت. قیمت روز و ارسال سریع به سراسر ایران.',
};

export default async function HomePage() {
  let featuredProducts: ProductListItem[] = [];
  let silverProducts: ProductListItem[] = [];
  let categories: Category[] = [];
  let heroBanners: Banner[] = [];
  let featureBanners: Banner[] = [];
  let activePromos: PromoCode[] = [];

  try {
    const [productsData, silverData, catData, heroData, featureData, promoData] = await Promise.all([
      serverFetch<{ items: ProductListItem[] }>('/products/?limit=8'),
      serverFetch<{ items: ProductListItem[] }>('/products/?metal=silver&limit=8'),
      serverFetch<Category[]>('/categories/'),
      serverFetch<Banner[]>('/banners/?placement=hero'),
      serverFetch<Banner[]>('/banners/?placement=feature'),
      serverFetch<PromoCode[]>('/promos/active'),
    ]);
    featuredProducts = productsData.items ?? [];
    silverProducts = silverData.items ?? [];
    categories = Array.isArray(catData) ? catData : [];
    heroBanners = heroData ?? [];
    featureBanners = featureData ?? [];
    activePromos = promoData ?? [];
  } catch {
    // Backend may not be running; show empty state
  }

  const heroBanner = heroBanners[0];
  const featureBanner = featureBanners[0];

  return (
    <div>
      {/* Hero — real banner if one exists, otherwise the text fallback */}
      {heroBanner ? (
        <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
          <img src={heroBanner.image_url} alt={heroBanner.title ?? ''} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-14 sm:px-6">
            <div className="mx-auto max-w-7xl">
              {heroBanner.title && <h1 className="text-2xl font-semibold text-surface sm:text-4xl">{heroBanner.title}</h1>}
              {heroBanner.subtitle && <p className="mt-3 max-w-md text-sm text-surface/80 sm:text-base">{heroBanner.subtitle}</p>}
              <Link href={heroBanner.link_url ?? '/products'} className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover">
                مشاهده مجموعه
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden bg-accent-subtle">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-24">
            <div className="max-w-xl">
              <h1 className="text-2xl font-semibold leading-tight text-primary sm:text-4xl">زیورآلات اصیل با قیمت روز</h1>
              <p className="mt-4 text-sm leading-relaxed text-primary-muted sm:text-base">
                موج گالری، مرجع خرید آنلاین جواهرات و اکسسوری با ضمانت اصالت کالا، قیمت‌گذاری لحظه‌ای بر اساس نرخ روز فلزات گران‌بها و ارسال سریع به سراسر ایران.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/products" className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover">مشاهده محصولات</Link>
                <Link href="/products?metal=gold" className="inline-flex h-11 items-center justify-center rounded-md border border-accent bg-transparent px-6 text-sm font-medium text-accent transition-colors hover:bg-accent-subtle">طلای دست‌ساز</Link>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 start-0 end-0">
            <svg viewBox="0 0 1440 80" fill="none" className="w-full" aria-hidden="true">
              <path d="M0 40C360 80 720 0 1080 40C1260 60 1380 70 1440 70V80H0V40Z" fill="var(--color-surface)" />
              <path d="M0 40C360 80 720 0 1080 40C1260 60 1380 70 1440 70" fill="none" stroke="var(--color-wave)" strokeWidth="1" opacity="0.35" />
            </svg>
          </div>
        </section>
      )}

      {/* Category tiles */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h2 className="mb-5 text-lg font-medium text-primary sm:text-xl">دسته‌بندی‌ها</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.filter((c) => c.is_active).map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-md bg-surface-sunken">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-primary-subtle">—</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 start-3 text-sm font-medium text-surface">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

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