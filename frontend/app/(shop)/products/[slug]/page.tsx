import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api';
import type { Product } from '@/types';
import { IMAGE_DIMENSIONS } from '@/types';
import ProductDetailSkeleton from '@/components/skeletons/product-detail-skeleton';
import AddToCartClient from './add-to-cart-client';
import { SITE_NAME } from '@/lib/constants';

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

  const primaryImage = product.images.find((i) => i.is_primary);
  const otherImages = product.images.filter((i) => !i.is_primary).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
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
        {/* Image gallery */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-surface-elevated">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt_text}
                width={IMAGE_DIMENSIONS.large.width}
                height={IMAGE_DIMENSIONS.large.height}
                unoptimized
                className="h-full w-full object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-subtle">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {otherImages.length > 0 && (
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
              {[primaryImage, ...otherImages].filter(Boolean).map((img) => (
                <div
                  key={img!.id}
                  className="h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 border-border-default bg-surface-elevated"
                >
                  <Image
                    src={img!.url}
                    alt={img!.alt_text}
                    width={IMAGE_DIMENSIONS.thumb.width}
                    height={IMAGE_DIMENSIONS.thumb.height}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-5">
          <div>
            {product.category && (
              <a
                href={`/products?category=${product.category.slug}`}
                className="text-xs font-medium text-accent transition-colors hover:text-accent-hover"
              >
                {product.category.name}
              </a>
            )}
            <h1 className="mt-1 text-xl font-bold leading-snug text-primary sm:text-2xl">
              {product.name}
            </h1>
          </div>

          {/* Materials */}
          {product.materials.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.materials.map((mat) => (
                <span
                  key={mat.id}
                  className="rounded-full border border-border-default px-3 py-1 text-xs text-primary-muted"
                >
                  {mat.display_name} — {mat.weight_grams} گرم
                </span>
              ))}
            </div>
          )}

          {/* Weight */}
          <p className="text-sm text-primary-muted">
            وزن کل: <span className="font-medium text-primary">{product.total_weight_grams} گرم</span>
          </p>

          {/* Description */}
          {product.description && (
            <div className="border-t border-border-default pt-4">
              <h2 className="mb-2 text-sm font-semibold text-primary">توضیحات</h2>
              <p className="text-sm leading-relaxed text-primary-muted whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Add to cart — client component */}
          <div className="border-t border-border-default pt-4">
            <AddToCartClient
              productId={product.id}
              productName={product.name}
              basePrice={product.base_price}
              calculatedPrice={product.calculated_price}
              materialWeights={product.materials.map((m) => ({
                metal_type: m.metal_type,
                weight_grams: m.weight_grams,
              }))}
              stockQuantity={product.stock_quantity}
            />
          </div>
        </div>
      </div>
    </div>
  );
}