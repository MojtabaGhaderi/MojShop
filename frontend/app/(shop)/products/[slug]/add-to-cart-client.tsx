'use client';

import AddToCart from '@/components/add-to-cart';

export default function AddToCartClient(props: React.ComponentProps<typeof AddToCart>) {
  return <AddToCart {...props} />;
}