//(shop)/products/[slug]/page.tsx 
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api';
import type { Product } from '@/types';
import ProductDetailSkeleton from '@/components/skeletons/product-detail-skeleton';
import ProductGallery from '@/components/product-gallery';
import ProductCard from '@/components/product-card';
import AddToCartClient from './add-to-cart-client';
import { SITE_NAME } from '@/lib/constants';
import ReviewSection from '@/components/review-section';


export const revalidate = 0;
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await serverFetch<Product>(`/products/${slug}`);
    return {
      title: product.name,
      description: product.description?.slice(0, 160),
      openGraph: {
        title: `${product.name} | ${SITE_NAME}`,
        description: product.description?.slice(0, 160),
        images: product.images[0] ? [{ url: product.images[0].url, alt: product.images[0].alt_text }] : undefined,
        type: 'website',
      },
    };
  } catch {
    return { title: 'محصول یافت نشد' };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let product: Product;

  try {
    product = await serverFetch<Product>(`/products/${slug}`);
    if (!product.is_active) notFound();
  } catch {
    notFound();
  }

  let related: Product[] = [];
  try {
    related = await serverFetch<Product[]>(`/products/${slug}/related`);
  } catch {
    // non-critical — page still works without a related-products section
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <nav className="mb-6 flex items-center gap-2 text-xs text-primary-muted" aria-label="مسیر صفحه">
        <a href="/" className="transition-colors hover:text-accent">صفحه اصلی</a>
        <span>/</span>
        <a href="/products" className="transition-colors hover:text-accent">محصولات</a>
        <span>/</span>
        <a href={`/products?category=${product.category.slug}`} className="transition-colors hover:text-accent">
          {product.category.name}
        </a>
        <span>/</span>
        <span className="text-primary">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="space-y-5">
          <div>
            {product.category && (
              <a href={`/products?category=${product.category.slug}`} className="text-xs font-medium text-accent transition-colors hover:text-accent-hover">
                {product.category.name}
              </a>
            )}
            <h1 className="mt-1 text-xl font-bold leading-snug text-primary sm:text-2xl">{product.name}</h1>
          </div>

          {product.materials.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.materials.map((mat) => (
                <span key={mat.id} className="rounded-full border border-border-default px-3 py-1 text-xs text-primary-muted">
                  {mat.display_name} — {mat.weight_grams} گرم
                </span>
              ))}
            </div>
          )}
          {(product.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <a key={tag.id} href={`/products?tags=${tag.slug}`} className="rounded-full bg-surface-elevated px-3 py-1 text-xs text-primary-muted transition-colors hover:bg-accent-subtle hover:text-accent">
                  #{tag.name}
                </a>
              ))}
            </div>
          )}

          <p className="text-sm text-primary-muted">
            وزن کل: <span className="font-medium text-primary">{product.total_weight_grams} گرم</span>
          </p>

          {product.description && (
            <div className="border-t border-border-default pt-4">
              <h2 className="mb-2 text-sm font-semibold text-primary">توضیحات</h2>
              <p className="text-sm leading-relaxed text-primary-muted whitespace-pre-line">{product.description}</p>
            </div>
          )}

          <div className="border-t border-border-default pt-4">
            <AddToCartClient
              productId={product.id}
              productSlug={product.slug}
              productName={product.name}
              basePrice={product.base_price}
              calculatedPrice={product.current_price}
              materialWeights={product.materials.map((m) => ({ metal_type: m.metal_type, weight_grams: m.weight_grams }))}
              images={product.images}
              stockQuantity={product.stock_quantity}
              variants={product.variants}
            />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 text-lg font-bold text-primary">محصولات مشابه</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
      <ReviewSection slug={product.slug} />
      {product.review_count > 0 && (
        <p className="text-sm text-primary-muted">
          ⭐ {product.average_rating.toFixed(1)} از ۵ ({product.review_count} نظر)
        </p>
      )}
    </div>
  );
}