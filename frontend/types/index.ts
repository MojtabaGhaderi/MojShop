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
  variants: Variant[];
  current_price: number;
  average_rating: number;
  review_count: number;
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
  variants: Variant[];
  current_price: number;
  average_rating: number;
  review_count: number;
}

export interface ProductsResponse {
  items: ProductListItem[];
  total: number;
  skip: number;
  limit: number;
}

export interface CartItem {
  id: number;
  quantity: number;
  unit_price: number;        // NEW
  variant: Variant | null;
  product: {
    id: number;
    name: string;
    slug: string;
    current_price: number;
    images: ProductImage[];
  };
}

export interface CartItemAdd {
  product_id: number;
  quantity: number;
  variant_id?: number;       // NEW

}

export interface CartItemUpdate {
  quantity: number;
}

// --- Auth ---

export interface AuthUser {
  id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
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
  refresh_token: string;
  token_type: string;
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
  phone?: string;
  current_password?: string;
  new_password?: string;
}

// --- Addresses ---

export interface Address {
  id: number;
  user_id: number | null;
  label: string | null;
  line_1: string;
  line_2: string | null;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface AddressCreate {
  label?: string;
  line_1: string;
  line_2?: string;
  city: string;
  postal_code: string;
  country?: string;
  is_default?: boolean;
}

export interface AddressUpdate {
  label?: string;
  line_1?: string;
  line_2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  is_default?: boolean;
}

// --- Orders ---

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: number;
  product_name: string;
  product_slug: string;
  unit_price: number;
  quantity: number;
  materials_snapshot?: unknown;
  image_url: string | null;
}

export interface Invoice {
  id: number;
  order_id: number;
  invoice_number: string;
  pdf_url: string | null;
  status: string;
  created_at: string;
}

export interface Order {
  id: number;
  user_id: number | null;
  guest_email: string | null;
  guest_name: string | null;
  address: Address;
  status: OrderStatus;
  items: OrderItem[];
  invoice: Invoice | null;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  tax: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface OrderCreate {
  address_id: number;
  promo_code?: string;
}


export interface PaginatedOrders {
  total: number;
  items: Order[];
}
// --- Prices / filters ---

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

// --- Admin ---

export interface AdminAnalytics {
  revenue_today: number;
  revenue_week: number;
  revenue_month: number;
  pending_orders: number;
  total_customers: number;
  low_stock_products: { id: number; name: string; slug: string; stock_quantity: number }[];
  low_stock_threshold: number;
}

export interface ProductMaterialInput {
  metal_type: MetalType;
  weight_grams: number;
  display_name?: string;
}

export interface ProductImageInput {
  url: string;
  alt_text?: string;
  is_primary?: boolean;
  sort_order?: number;
}

export interface ProductCreateInput {
  name: string;
  slug: string;
  description?: string;
  category_id?: number;
  base_price: number;
  total_weight_grams?: number;
  stock_quantity?: number;
  is_active?: boolean;
  materials?: ProductMaterialInput[];
  images?: ProductImageInput[];
}

// --- Guest checkout ---

export interface GuestAddressInput {
  label?: string;
  line_1: string;
  line_2?: string;
  city: string;
  postal_code: string;
  country?: string;
}

export interface GuestOrderCreate {
  guest_name: string;
  guest_email: string;
  address: GuestAddressInput;
  items: { product_id: number; variant_id?: number; quantity: number }[];   // was missing variant_id
  promo_code?: string;
}

// --- Payments ---

export interface PaymentCreateResponse {
  payment_url: string;
  authority: string;
}

export interface PaymentVerifyResponse {
  status: 'success' | 'failed';
  ref_id: string | null;
  order_status: OrderStatus;
  message?: string;
}

// --- Promo codes ---

export interface PromoValidateResponse {
  valid: boolean;
  discount_amount: number;
  message?: string;
}

export type PromoType = 'percent' | 'fixed';

export interface PromoCode {
  id: number;
  code: string;
  type: PromoType;
  amount: number;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

// --- Shipping ---

export interface ShippingRate {
  id: number;
  city: string;
  cost: number;
}

export type ProductUpdateInput = Partial<ProductCreateInput>;


export interface ShopCartItem {
  id: number | string;   // number for authenticated (real DB id), string (uuid) for guest
  product_id: number;
  variant_id: number | null;
  quantity: number;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'current_price' | 'images'>;
  unitPrice: number;      // resolved price including any variant adjustment
}



export interface Variant {
  id: number;
  variant_name: string;
  sku: string | null;
  price_adjustment: number;
  stock_quantity: number;
  is_active: boolean;
}

export interface ReviewUser {
  id: number;
  full_name: string | null;
}

export interface Review {
  id: number;
  product_id: number;
  user: ReviewUser;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ReviewCreate {
  rating: number;
  comment?: string;
}

export interface WishlistItem {
  id: number;
  product: ProductListItem;
  created_at: string;
}