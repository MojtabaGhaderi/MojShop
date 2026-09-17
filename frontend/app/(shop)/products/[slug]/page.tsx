// app/(shop)/products/[slug]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api';
import type { Product } from '@/types';
import ProductGallery from '@/components/product-gallery';
import AddToCartClient from './add-to-cart-client';
import { SITE_NAME } from '@/lib/constants';
import ReviewSection from '@/components/review-section';
import { ProductSpecCard } from '@/components/product-spec-card';
import { ProductDescriptionAccordion } from '@/components/product-description-accordion';
import { RelatedProductsRail } from '@/components/related-products-rail';

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
    // Non-critical
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 select-none" dir="rtl">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground" aria-label="مسیر صفحه">
        <Link href="/" className="transition-colors hover:text-accent">صفحه اصلی</Link>
        <span>/</span>
        <Link href="/products" className="transition-colors hover:text-accent">محصولات</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/products?category=${product.category.slug}`} className="transition-colors hover:text-accent">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Single-Column Editorial Stack */}
      <div className="flex flex-col gap-6">
        {/* 1. Imagery */}
        <div className="w-full">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* 2. Product Name & Category */}
        <div className="space-y-2 border-b border-border/60 pb-5">
          {product.category && (
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-xs font-medium text-accent tracking-wider hover:underline"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            {product.name}
          </h1>

          {/* Tags */}
          {(product.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {product.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/products?tags=${tag.slug}`}
                  className="rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 3. Description (Part 1: Alabaster Grain) */}
        {product.description && (
          <ProductDescriptionAccordion description={product.description} />
        )}

        {/* 4. Specs Card (Part 2: Warm Sand Texture) */}
        <div>
          <ProductSpecCard
            totalWeightGrams={product.total_weight_grams}
            materials={product.materials}
            categoryName={product.category?.name}
            sku={product.slug}
          />
        </div>

        {/* 5. Add To Cart (Part 3: Sky-Blue Glass with Conic Light Beam) */}
        <div className="pt-2">
          <AddToCartClient
            productId={product.id}
            productSlug={product.slug}
            productName={product.name}
            basePrice={product.base_price}
            calculatedPrice={product.current_price}
            materialWeights={product.materials.map((m) => ({
              metal_type: m.metal_type,
              weight_grams: m.weight_grams,
            }))}
            images={product.images}
            stockQuantity={product.stock_quantity}
            variants={product.variants}
          />
        </div>
      </div>

      {/* 6. Infinite Circular Related Products Rail */}
      {related.length > 0 && (
        <RelatedProductsRail products={related} />
      )}

      {/* 7. Redesigned Reviews Section */}
      <ReviewSection slug={product.slug} />
    </div>
  );
}