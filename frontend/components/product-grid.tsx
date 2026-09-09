//components/product-grid.tsx
import ProductCard from './product-card';
import ProductCardSkeleton from './skeletons/product-card-skeleton';
import type { ProductListItem } from '@/types';

interface ProductGridProps {
  products: ProductListItem[];
  isLoading?: boolean;
  isServerFetched?: boolean;
}

export default function ProductGrid({
  products,
  isLoading = false,
  isServerFetched = false,
}: ProductGridProps) {
  if (isServerFetched && products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-primary-muted">
          در حال حاضر محصولی برای نمایش وجود ندارد.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {isLoading
        ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
        : products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
    </div>
  );
}