export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
}

export interface Material {
  id: number;
  metal_type: MetalType;
  weight_grams: number;
  display_name: string;
}

export type MetalType = 'gold' | 'silver' | 'platinum' | 'palladium';

export interface ProductImage {
  id: number;
  url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  total_weight_grams: number;
  stock_quantity: number;
  is_active: boolean;
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  materials: Material[];
  images: ProductImage[];
  calculated_price: number;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  base_price: number;
  stock_quantity: number;
  is_active: boolean;
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  materials: Material[];
  images: ProductImage[];
  calculated_price: number;
}

export interface ProductsResponse {
  items: ProductListItem[];
  total: number;
  skip: number;
  limit: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    name: string;
    slug: string;
    calculated_price: number;
    images: ProductImage[];
  };
}

export interface CartItemAdd {
  product_id: number;
  quantity: number;
}

export interface CartItemUpdate {
  quantity: number;
}

export interface Order {
  id: number;
  status: string;
  total_price: number;
  created_at: string;
}

export interface OrderDetail extends Order {
  items: CartItem[];
}

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface MetalRate {
  metal_type: MetalType;
  rate_per_gram: number;
  label: string;
}

export interface PriceResponse {
  rates: MetalRate[];
  updated_at: string;
}

export interface ProductFilters {
  category?: string;
  metal?: MetalType;
  search?: string;
  skip?: number;
  limit?: number;
}

export type ImageSize = 'thumb' | 'medium' | 'large';

export const IMAGE_DIMENSIONS: Record<ImageSize, { width: number; height: number }> = {
  thumb: { width: 300, height: 300 },
  medium: { width: 800, height: 800 },
  large: { width: 1600, height: 1600 },
};
