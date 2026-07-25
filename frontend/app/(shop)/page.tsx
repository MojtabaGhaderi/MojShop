import type { Metadata } from 'next';
import Link from 'next/link';
import ProductGrid from '@/components/product-grid';
import { serverFetch } from '@/lib/api';
import type { ProductListItem, Category } from '@/types';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `${SITE_NAME} — فروشگاه آنلاین جواهرات و اکسسوری`,
  description: 'مجموعه‌ای از زیورآلات طلا، نقره و بدلیجات با ضمانت اصالت. قیمت روز و ارسال سریع به سراسر ایران.',
};

interface HomePageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  let featuredProducts: ProductListItem[] = [];
  let categories: Category[] = [];

  try {
    const [productsData, catData] = await Promise.all([
      serverFetch<{ items: ProductListItem[]; total: number }>('/products/?limit=8'),
      serverFetch<Category[]>('/categories/'),
    ]);
    featuredProducts = productsData.items ?? [];
    categories = Array.isArray(catData) ? catData : [];
  } catch {
    // Backend may not be running; show empty state
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-accent-subtle">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="max-w-xl">
            <h1 className="text-2xl font-bold leading-tight text-primary sm:text-4xl">
              زیورآلات اصیل با قیمت روز
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-primary-muted sm:text-base">
              موج گالری، مرجع خرید آنلاین جواهرات و اکسسوری با ضمانت اصالت
              کالا، قیمت‌گذاری لحظه‌ای بر اساس نرخ روز فلزات گران‌بها و ارسال
              سریع به سراسر ایران.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-accent px-6 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
              >
                مشاهده محصولات
              </Link>
              <Link
                href="/products?metal=gold"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-accent bg-transparent px-6 text-sm font-medium text-accent transition-colors hover:bg-accent-subtle"
              >
                طلای دست‌ساز
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative wave shape */}
        <div className="absolute bottom-0 start-0 end-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full" aria-hidden="true">
            <path
              d="M0 40C360 80 720 0 1080 40C1260 60 1380 70 1440 70V80H0V40Z"
              fill="var(--color-surface)"
            />
          </svg>
        </div>
      </section>

      {/* Categories strip */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
            {categories
              .filter((c) => c.is_active)
              .map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="shrink-0 rounded-full border border-border-default bg-card px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
                >
                  {cat.name}
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary sm:text-xl">
            جدیدترین محصولات
          </h2>
          <Link
            href="/products"
            className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            مشاهده همه ←
          </Link>
        </div>
        <ProductGrid
          products={featuredProducts}
          isLoading={false}
          isServerFetched
        />
      </section>

      {/* Trust badges */}
      <section className="border-y border-border-default bg-surface-elevated">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4 sm:px-6">
          {[
            { icon: '🛡️', title: 'ضمانت اصالت', desc: 'تمامی محصولات دارای ضمانت هستند' },
            { icon: '🚚', title: 'ارسال سریع', desc: 'ارسال به سراسر ایران' },
            { icon: '💰', title: 'قیمت روز', desc: 'قیمت‌گذاری لحظه‌ای بر اساس نرخ روز' },
            { icon: '↩️', title: 'بازگشت کالا', desc: '۷ روز ضمانت بازگشت کالا' },
          ].map((badge) => (
            <div key={badge.title} className="text-center">
              <span className="text-2xl" role="img" aria-label={badge.title}>{badge.icon}</span>
              <h3 className="mt-2 text-sm font-semibold text-primary">{badge.title}</h3>
              <p className="mt-1 text-xs text-primary-muted">{badge.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}